"""
Know Your Leader — Data Update Pipeline v2 (2026 Ready)
=========================================================
Daily candidate discovery pipeline for Tamil Nadu 2026 elections.

PRIMARY PURPOSE:
  Find who is contesting from each constituency — from news & official platforms.

PROFILE DATA POLICY:
  Profile fields (age, education, assets, criminal cases, local issues) are
  populated ONCE when a candidate is first discovered. They are NEVER overwritten
  on subsequent runs. To update a candidate's profile, edit candidates.json directly.

Data Sources:
  1. MyNeta.info — ECI verified candidate data (dynamic year: 2026 → 2021 fallback)
  2. RSS News Feeds — Tamil Nadu 2026 election news
  3. OpenRouter (Llama 3.3) — Intelligent extraction from news articles
  4. Rule-based fallback — Pattern matching when no LLM is available

Usage:
    python scripts/update_data.py                     # Full pipeline
    python scripts/update_data.py --skip-news          # MyNeta only
    python scripts/update_data.py --skip-profiles      # Skip age fetching (faster)
    python scripts/update_data.py --skip-news --skip-profiles  # Fastest

Environment Variables (optional):
    OPENROUTER_API_KEY — OpenRouter key (free tier supported)
"""

import json
import os
import re
import sys
import time
import html
from datetime import datetime
from pathlib import Path

try:
    import feedparser
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "feedparser", "requests", "beautifulsoup4"])
    import feedparser
    import requests
    from bs4 import BeautifulSoup

# ──────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────

# API Keys — set via environment variable; falls back to empty string if not set
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# OpenRouter (PRIMARY LLM)
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# RSS Feeds
RSS_FEEDS = [
    "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss",
    "https://timesofindia.indiatimes.com/rssfeeds/4923200.cms",
    "https://www.ndtv.com/rss/tamil-nadu",
    "https://indianexpress.com/section/cities/chennai/feed/",
    "https://www.deccanherald.com/rss/tamil-nadu.rss",
]

# MyNeta Base
MYNETA_BASE_URL = "https://myneta.info"
MYNETA_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
CANDIDATES_FILE = DATA_DIR / "candidates.json"
DISTRICTS_FILE = DATA_DIR / "districts.json"

# Valid locations (loaded at startup)
VALID_DISTRICTS: set[str] = set()
VALID_CONSTITUENCIES: set[str] = set()
CONSTITUENCY_NAME_TO_ID: dict[str, str] = {}
DISTRICT_NAME_TO_ID: dict[str, str] = {}
CONSTITUENCY_TO_DISTRICT: dict[str, str] = {}  # Cached lookup: constituency_id → district_id

# Party colors
PARTY_COLORS = {
    "DMK": "#E31E24",
    "AIADMK": "#006B3F",
    "BJP": "#FF6B00",
    "INC": "#19AAED",
    "PMK": "#FFD700",
    "DMDK": "#1E90FF",
    "NTK": "#8B0000",
    "MDMK": "#800080",
    "CPI": "#FF0000",
    "CPI(M)": "#CC0000",
    "TVK": "#FFAA00",
    "IND": "#888888",
}

# Keywords
PARTY_KEYWORDS = [
    "DMK", "AIADMK", "BJP", "INC", "Congress", "PMK", "DMDK", "NTK",
    "MDMK", "CPI", "CPI(M)", "TVK", "Naam Tamilar", "Makkal Needhi Maiam",
]

ELECTION_KEYWORDS = [
    "candidate", "contestant", "contesting", "nomination", "MLA",
    "assembly election", "constituency", "bypolls", "bye-election",
    "fielded", "ticket", "seat", "nominee", "poll",
]


def load_valid_locations():
    """Load valid district/constituency IDs and build name→ID lookup maps."""
    global VALID_DISTRICTS, VALID_CONSTITUENCIES, CONSTITUENCY_NAME_TO_ID, DISTRICT_NAME_TO_ID, CONSTITUENCY_TO_DISTRICT
    with open(DISTRICTS_FILE, "r", encoding="utf-8") as f:
        districts = json.load(f)
    for d in districts:
        VALID_DISTRICTS.add(d["id"])
        DISTRICT_NAME_TO_ID[d["name"].lower()] = d["id"]
        DISTRICT_NAME_TO_ID[d.get("nameTamil", "").lower()] = d["id"]
        for c in d["constituencies"]:
            VALID_CONSTITUENCIES.add(c["id"])
            CONSTITUENCY_NAME_TO_ID[c["name"].lower()] = c["id"]
            CONSTITUENCY_NAME_TO_ID[c.get("nameTamil", "").lower()] = c["id"]
            clean = c["name"].lower().replace(" ", "").replace("-", "")
            CONSTITUENCY_NAME_TO_ID[clean] = c["id"]
            # Cache constituency → district mapping (avoids re-reading JSON per candidate)
            CONSTITUENCY_TO_DISTRICT[c["id"]] = d["id"]


# ══════════════════════════════════════════════════════
# SOURCE 1: MyNeta.info — ECI Verified Data (Dynamic Year)
# ══════════════════════════════════════════════════════

def get_active_myneta_config() -> tuple[str, str]:
    """Check if 2026 data is available, otherwise fallback to 2021."""
    headers = {"User-Agent": "Mozilla/5.0"}
    url_2026 = f"{MYNETA_BASE_URL}/TamilNadu2026/index.php"

    try:
        resp = requests.get(url_2026, headers=headers, timeout=10)
        if resp.status_code == 200 and "Tamil Nadu" in resp.text:
            print("  [SUCCESS] 2026 Election data is LIVE on MyNeta! Scraping Candidates...")
            return "TamilNadu2026", "candidates_analyzed"
    except requests.RequestException:
        pass

    print("  [INFO] 2026 ECI data not yet live on MyNeta. Falling back to 2021 Incumbent Winners...")
    return "TamilNadu2021", "winner_analyzed"


def scrape_myneta_data(fetch_profiles: bool = True) -> list[dict]:
    """
    Scrape official ECI data from MyNeta.info.
    Phase 1: Scrape summary pages (fast — name, party, constituency, assets, cases, education)
    Phase 2: Fetch individual profiles for age (slower, optional via --skip-profiles)
    """
    election_year, sub_action = get_active_myneta_config()

    # ── Phase 1: Summary pages ──────────────────────────
    print(f"\n  Phase 1: Scraping {election_year} summary pages...")
    raw_candidates = []  # Candidates with profile links (temporary)
    page_num = 1

    while page_num <= 10:  # Safety cap: TN has 3 pages max (~75 each = ~224 total)
        url = (
            f"{MYNETA_BASE_URL}/{election_year}/index.php"
            f"?action=summary&subAction={sub_action}&sort=default&page={page_num}"
        )
        print(f"    Page {page_num}...", end=" ", flush=True)

        try:
            resp = requests.get(url, headers=MYNETA_HEADERS, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"FAILED ({e})")
            break

        soup = BeautifulSoup(resp.content, "html.parser")

        # Find ALL anchor tags that link to candidate.php — this is the most reliable selector
        candidate_links = soup.find_all("a", href=re.compile(r"candidate\.php\?candidate_id=\d+"))

        if not candidate_links:
            print("0 candidates → stopping pagination.")
            break

        page_count = 0
        for link in candidate_links:
            # Walk up to the parent <tr> to extract all columns
            tr = link.find_parent("tr")
            if not tr:
                continue

            cols = tr.find_all("td")
            if len(cols) < 7:
                continue

            name = link.text.strip()
            if not name:
                continue

            profile_href = link.get("href", "")
            constituency_raw = cols[2].text.strip()
            party_raw = cols[3].text.strip()
            cases_raw = cols[4].text.strip()
            education_raw = cols[5].text.strip()
            assets_raw = cols[6].text.strip()

            constituency_id = _match_constituency(constituency_raw)
            district_id = _find_district_for_constituency(constituency_id) if constituency_id else None

            if not constituency_id or not district_id:
                continue

            assets = _parse_indian_number(assets_raw)
            try:
                cases = int(re.sub(r"[^\d]", "", cases_raw)) if cases_raw and re.search(r"\d", cases_raw) else 0
            except ValueError:
                cases = 0

            raw_candidates.append({
                "name": name,
                "nameTamil": "",
                "party": _normalize_party(party_raw),
                "constituencyId": constituency_id,
                "districtId": district_id,
                "source": "official",
                "declaredAssets": assets,
                "pendingCriminalCases": cases,
                "education": education_raw if education_raw.lower() not in ("", "nan", "null") else "",
                "localIssues": [],
                "age": 0,
                "_profile_url": f"{MYNETA_BASE_URL}/{election_year}/{profile_href}" if profile_href else "",
            })
            page_count += 1

        print(f"{page_count} candidates")
        page_num += 1
        time.sleep(0.5)

    print(f"  Phase 1 complete: {len(raw_candidates)} candidates from summary pages.\n")

    # ── Phase 2: Individual profiles for age ─────────────
    if fetch_profiles and raw_candidates:
        print(f"  Phase 2: Fetching age from {len(raw_candidates)} profiles...")
        ages_found = 0

        for i, c in enumerate(raw_candidates):
            profile_url = c.pop("_profile_url", "")
            if not profile_url:
                continue

            try:
                p_resp = requests.get(profile_url, headers=MYNETA_HEADERS, timeout=15)
                page_text = BeautifulSoup(p_resp.content, "html.parser").get_text()

                age_match = re.search(r"Age:\s*(\d+)", page_text)
                if age_match:
                    c["age"] = int(age_match.group(1))
                    ages_found += 1

                if (i + 1) % 25 == 0 or i == len(raw_candidates) - 1:
                    print(f"    [{i+1}/{len(raw_candidates)}] ({ages_found} ages found)")

                time.sleep(0.3)
            except Exception:
                pass  # Age is nice-to-have, don't fail the whole pipeline

        print(f"  Phase 2 complete: {ages_found}/{len(raw_candidates)} ages found.\n")
    else:
        for c in raw_candidates:
            c.pop("_profile_url", None)
        if not fetch_profiles:
            print("  Phase 2: Skipped (--skip-profiles)\n")

    print(f"  ✅ Total: {len(raw_candidates)} verified ECI profiles from MyNeta.info")
    return raw_candidates


def _match_constituency(name: str) -> str | None:
    """Fuzzy match constituency name to our IDs."""
    name_lower = name.lower().strip()
    if name_lower in CONSTITUENCY_NAME_TO_ID:
        return CONSTITUENCY_NAME_TO_ID[name_lower]
    clean = name_lower.replace(" ", "").replace("-", "")
    if clean in CONSTITUENCY_NAME_TO_ID:
        return CONSTITUENCY_NAME_TO_ID[clean]
    for known_name, cid in CONSTITUENCY_NAME_TO_ID.items():
        if known_name and (known_name in name_lower or name_lower in known_name):
            return cid
    return None


def _find_district_for_constituency(constituency_id: str) -> str | None:
    """Find which district a constituency belongs to (cached lookup)."""
    return CONSTITUENCY_TO_DISTRICT.get(constituency_id)


def _parse_indian_number(text: str) -> int:
    """Parse Indian-style numbers like 'Rs 1,23,45,678' or '₹ 12.5 Cr'."""
    exact_part = text.split("~")[0]
    digits = re.sub(r"[^\d]", "", exact_part)
    return int(digits) if digits else 0


def _normalize_party(party: str) -> str:
    """Normalize party name to standard abbreviation."""
    party = party.strip().upper()
    mappings = {
        "INDIAN NATIONAL CONGRESS": "INC",
        "BHARATIYA JANATA PARTY": "BJP",
        "DRAVIDA MUNNETRA KAZHAGAM": "DMK",
        "ALL INDIA ANNA DRAVIDA MUNNETRA KAZHAGAM": "AIADMK",
        "PATTALI MAKKAL KATCHI": "PMK",
        "DESIYA MURPOKKU DRAVIDA KAZHAGAM": "DMDK",
        "NAAM TAMILAR KATCHI": "NTK",
        "MARUMALARCHI DRAVIDA MUNNETRA KAZHAGAM": "MDMK",
        "COMMUNIST PARTY OF INDIA": "CPI",
        "COMMUNIST PARTY OF INDIA (MARXIST)": "CPI(M)",
        "TAMILAGA VETTRI KAZHAGAM": "TVK",
        "INDEPENDENT": "IND",
    }
    return mappings.get(party, party)


# ══════════════════════════════════════════════════════
# SOURCE 2: RSS News Feeds
# ══════════════════════════════════════════════════════

def fetch_articles() -> list[dict]:
    """Fetch articles from all configured RSS feeds."""
    articles = []
    for feed_url in RSS_FEEDS:
        try:
            print(f"  Fetching: {feed_url}")
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]:
                title = entry.get("title", "")
                summary = entry.get("summary", entry.get("description", ""))
                summary = re.sub(r"<[^>]+>", "", summary)
                summary = html.unescape(summary).strip()
                articles.append({
                    "title": title,
                    "summary": summary[:500],
                    "link": entry.get("link", ""),
                    "published": entry.get("published", ""),
                })
        except Exception as e:
            print(f"  Warning: Failed to fetch {feed_url}: {e}")

    relevant = []
    for a in articles:
        text = (a["title"] + " " + a["summary"]).lower()
        if (
            any(kw.lower() in text for kw in PARTY_KEYWORDS)
            and any(kw.lower() in text for kw in ELECTION_KEYWORDS)
        ) or ("tamil nadu" in text and "election" in text):
            relevant.append(a)

    print(f"  Total articles fetched: {len(articles)}, election-relevant: {len(relevant)}")
    return relevant if relevant else articles[:10]  # Fallback to first 10 if no relevant found


# ══════════════════════════════════════════════════════
# SOURCE 3: OpenRouter LLM
# ══════════════════════════════════════════════════════

EXTRACTION_PROMPT = """You are a data extraction assistant for Tamil Nadu elections.

Analyze the following news articles and extract candidate information for the
Tamil Nadu 2026 Assembly Elections ONLY.

For each candidate mentioned, return a JSON object with:
- name: Full name in English
- nameTamil: Name in Tamil (empty string if unavailable)
- party: Party abbreviation (DMK, AIADMK, BJP, INC, PMK, DMDK, NTK, etc.)
- constituencyId: Constituency slug (lowercase, hyphenated, e.g. "coimbatore-south")
- districtId: District slug (lowercase, e.g. "coimbatore")
- declaredAssets: Assets in INR (integer, 0 if unknown)
- pendingCriminalCases: Criminal cases count (integer, 0 if unknown)
- localIssues: Array of issues like ["Water", "Roads", "Healthcare"]
- education: Education (string, empty if unknown)
- age: Age (integer, 0 if unknown)

CRITICAL RULES:
- ONLY extract candidates explicitly mentioned as contesting/nominated for 2026 TN elections
- Do NOT fabricate or guess any data
- If an article has no candidate info, skip it
- Return ONLY a valid JSON array

ARTICLES:
{articles}

Respond with ONLY a JSON array (or empty array []):"""


def extract_via_openrouter(articles: list[dict]) -> list[dict]:
    """Extract candidates using OpenRouter (with retry and exponential backoff)."""
    if not OPENROUTER_API_KEY:
        print("  No OPENROUTER_API_KEY set. Skipping LLM extraction.")
        print("  Set: OPENROUTER_API_KEY=your_key_here (free at https://openrouter.ai)")
        return []

    print("  Using OpenRouter Llama 3.3 for news extraction...")
    extracted = []

    articles_text = "\n\n---\n\n".join(
        f"Title: {a['title']}\nSummary: {a['summary']}"
        for a in articles[:5]  # Only 5 articles to conserve tokens
    )

    max_attempts = 4
    wait_times = [15, 30, 60, 90]

    for attempt in range(max_attempts):
        try:
            response = requests.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://know-your-leader.pages.dev",
                    "X-Title": "Know Your Leader",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": EXTRACTION_PROMPT.format(articles=articles_text)}],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                },
                timeout=90,
            )

            if response.status_code == 429:
                wait = wait_times[min(attempt, len(wait_times) - 1)]
                remaining = max_attempts - attempt - 1
                print(f"  Rate limited (429). Waiting {wait}s... (attempt {attempt+1}/{max_attempts}, {remaining} retries left)")
                time.sleep(wait)
                continue

            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]

            json_match = re.search(r"\[.*\]", content, re.DOTALL)
            if json_match:
                candidates = json.loads(json_match.group())
                extracted.extend(candidates)
                print(f"  OpenRouter extracted {len(candidates)} candidates")
            else:
                print("  OpenRouter: No candidates found in articles (normal if no election news)")
            return extracted

        except requests.exceptions.HTTPError as e:
            print(f"  OpenRouter HTTP error: {e}")
            break
        except (KeyError, json.JSONDecodeError) as e:
            print(f"  OpenRouter parse error: {e}")
            break
        except Exception as e:
            print(f"  OpenRouter error: {e}")
            break

    if not extracted:
        print("  OpenRouter: All retries exhausted. Falling through to rule-based extraction.")
    return extracted


# ══════════════════════════════════════════════════════
# SOURCE 4: Rule-Based Extraction (NO API NEEDED)
# ══════════════════════════════════════════════════════

def extract_via_rules(articles: list[dict]) -> list[dict]:
    """
    Rule-based candidate extraction from news articles.
    No LLM needed — uses pattern matching.
    Less accurate but always works for free.
    """
    print("  Using rule-based extraction (no API required)...")
    extracted = []

    for article in articles:
        text = article["title"] + " " + article["summary"]

        parties_found = [p for p in PARTY_KEYWORDS if p.lower() in text.lower()]

        constituencies_found = [
            cid for name, cid in CONSTITUENCY_NAME_TO_ID.items()
            if name and len(name) > 2 and name in text.lower()
        ]
        districts_found = [
            did for name, did in DISTRICT_NAME_TO_ID.items()
            if name and len(name) > 2 and name in text.lower()
        ]

        name_patterns = [
            r"(?:Mr\.|Ms\.|Mrs\.|Dr\.|Thiru\.|Selvi\.|Selvan\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
            r'"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)"',
            r"'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'",
        ]

        names_found = []
        for pattern in name_patterns:
            names_found.extend(re.findall(pattern, text))

        if names_found and parties_found and (constituencies_found or districts_found):
            for name in names_found[:2]:
                candidate = {
                    "name": name.strip(),
                    "nameTamil": "",
                    "party": parties_found[0] if parties_found else "IND",
                    "constituencyId": constituencies_found[0] if constituencies_found else "",
                    "districtId": districts_found[0] if districts_found else "",
                    "source": "news",
                    "declaredAssets": 0,
                    "pendingCriminalCases": 0,
                    "localIssues": [],
                    "education": "",
                    "age": 0,
                }
                if candidate["constituencyId"] or candidate["districtId"]:
                    extracted.append(candidate)

    print(f"  Rule-based extraction found {len(extracted)} potential candidates")
    return extracted


# ══════════════════════════════════════════════════════
# Validation, Dedup & Merge
# ══════════════════════════════════════════════════════

def _normalize_name_key(name: str) -> str:
    """
    Normalize a candidate name for deduplication.
    Uses a condensed key: strip punctuation, remove single-char initials,
    join remaining name parts WITHOUT spaces, then sort alphabetically.
    
    Examples:
      'P.K. Sekar Babu'  → 'babusekar'  (initials stripped, parts joined+sorted)
      'Sekarbabu. P.K'   → 'sekarbabu'  (initials stripped, single token)
    
    For these to match, we use BOTH this key AND a "contains" check in dedup.
    """
    # Remove dots, commas, extra spaces
    clean = re.sub(r"[.,;:'\"\-]", " ", name.lower().strip())
    clean = re.sub(r"\s+", " ", clean).strip()
    
    tokens = clean.split()
    # Keep only name parts (2+ chars), drop single-letter initials
    name_parts = [t for t in tokens if len(t) > 1]
    
    # Sort and join without spaces → "condensed" form
    return "".join(sorted(name_parts))


def _names_match(name_a: str, name_b: str) -> bool:
    """
    Check if two candidate names refer to the same person.
    Handles: 'P.K. Sekar Babu' vs 'Sekarbabu. P.K'
    """
    key_a = _normalize_name_key(name_a)
    key_b = _normalize_name_key(name_b)
    
    # Exact normalized match
    if key_a == key_b:
        return True
    
    # One contains the other (handles "sekarbabu" vs "babusekar" → no)
    # But handles "senthilbalaji" vs "balajisenthil" → no
    # Better: check if one condensed form is a substring of the other
    if key_a in key_b or key_b in key_a:
        return True
    
    # Sort the characters themselves for anagram-like matching
    # "babusekar" sorted = "aabbeksru" vs "sekarbabu" sorted = "aabbeksru" ✓
    if sorted(key_a) == sorted(key_b):
        return True
    
    return False


def validate_candidate(candidate: dict) -> bool:
    """Validate that a candidate has required fields and valid location."""
    required = ["name", "party", "constituencyId", "districtId"]
    if not all(candidate.get(f) for f in required):
        return False

    if candidate["districtId"] not in VALID_DISTRICTS:
        dist_id = DISTRICT_NAME_TO_ID.get(candidate["districtId"].lower())
        if dist_id:
            candidate["districtId"] = dist_id
        else:
            return False

    if candidate["constituencyId"] not in VALID_CONSTITUENCIES:
        con_id = _match_constituency(candidate["constituencyId"])
        if con_id:
            candidate["constituencyId"] = con_id
        else:
            return False

    return True


def _candidate_quality_score(c: dict) -> int:
    """Score a candidate entry by how much useful data it has."""
    score = 0
    if c.get("nameTamil"):
        score += 3
    if c.get("age", 0) > 0:
        score += 2
    if c.get("declaredAssets", 0) > 0:
        score += 1
    if c.get("pendingCriminalCases", 0) > 0:
        score += 1
    if c.get("education"):
        score += 1
    if c.get("localIssues"):
        score += len(c["localIssues"])
    if c.get("source") == "official":
        score += 2
    return score


def _merge_into(target: dict, source: dict):
    """
    Fill EMPTY fields in target from source. Never overwrite existing data.
    This ensures profile data (assets, cases, age, etc.) is populated once
    and preserved across subsequent pipeline runs.
    """
    # Profile fields — only fill if target is empty/zero
    if source.get("declaredAssets", 0) > 0 and target.get("declaredAssets", 0) == 0:
        target["declaredAssets"] = source["declaredAssets"]
    if source.get("pendingCriminalCases", 0) > 0 and target.get("pendingCriminalCases", 0) == 0:
        target["pendingCriminalCases"] = source["pendingCriminalCases"]
    if source.get("age", 0) > 0 and target.get("age", 0) == 0:
        target["age"] = source["age"]
    if source.get("education") and not target.get("education"):
        target["education"] = source["education"]
    if source.get("nameTamil") and not target.get("nameTamil"):
        target["nameTamil"] = source["nameTamil"]
    if source.get("localIssues") and not target.get("localIssues"):
        target["localIssues"] = source["localIssues"]
    # Source tag — "official" always wins
    if source.get("source") == "official":
        target["source"] = "official"


def dedup_existing(candidates: list[dict]) -> list[dict]:
    """
    Remove duplicate candidates from existing data.
    Groups by (constituency, party) then pairwise fuzzy-matches names.
    Merges data from duplicates into the highest-quality entry.
    """
    # Group by (constituency, party)
    groups: dict[tuple, list[int]] = {}
    for i, c in enumerate(candidates):
        key = (c.get("constituencyId", ""), c.get("party", ""))
        groups.setdefault(key, []).append(i)

    to_remove = set()
    merge_count = 0

    for key, indices in groups.items():
        if len(indices) <= 1:
            continue

        # Pairwise compare names within the same party+constituency
        merged_sets: list[set[int]] = []
        for i in range(len(indices)):
            if indices[i] in to_remove:
                continue
            current_set = {indices[i]}
            for j in range(i + 1, len(indices)):
                if indices[j] in to_remove:
                    continue
                if _names_match(candidates[indices[i]]["name"], candidates[indices[j]]["name"]):
                    current_set.add(indices[j])
            if len(current_set) > 1:
                merged_sets.append(current_set)

        for group in merged_sets:
            # Pick the best entry as keeper
            scored = [(idx, _candidate_quality_score(candidates[idx])) for idx in group]
            scored.sort(key=lambda x: x[1], reverse=True)
            keeper_idx = scored[0][0]

            for idx, _ in scored[1:]:
                _merge_into(candidates[keeper_idx], candidates[idx])
                to_remove.add(idx)
                merge_count += 1

            candidates[keeper_idx]["lastUpdated"] = datetime.now().strftime("%Y-%m-%d")

    if merge_count > 0:
        result = [c for i, c in enumerate(candidates) if i not in to_remove]
        print(f"  Dedup: merged {merge_count} duplicates → {len(result)} unique candidates")
        return result
    else:
        print("  Dedup: no duplicates found")

    return candidates


def merge_candidates(existing: list[dict], new_candidates: list[dict]) -> list[dict]:
    """Merge new candidates into existing data using fuzzy name matching."""
    # Build indices by (constituency, party) for fast fuzzy lookup
    group_index: dict[tuple, list[int]] = {}
    for i, c in enumerate(existing):
        key = (c.get("constituencyId", ""), c.get("party", ""))
        group_index.setdefault(key, []).append(i)

    today = datetime.now().strftime("%Y-%m-%d")
    added = 0
    updated = 0

    for nc in new_candidates:
        if not validate_candidate(nc):
            continue

        source = nc.get("source", "news")
        group_key = (nc["constituencyId"], nc.get("party", ""))

        # Search for fuzzy name match within same constituency+party
        match_idx = None
        for idx in group_index.get(group_key, []):
            if _names_match(nc["name"], existing[idx]["name"]):
                match_idx = idx
                break

        if match_idx is not None:
            _merge_into(existing[match_idx], nc)
            existing[match_idx]["lastUpdated"] = today
            updated += 1
        else:
            candidate = {
                "id": f"candidate-auto-{len(existing) + added + 1:04d}",
                "name": nc["name"],
                "nameTamil": nc.get("nameTamil", ""),
                "party": nc["party"],
                "partyColor": PARTY_COLORS.get(nc["party"], "#888888"),
                "constituencyId": nc["constituencyId"],
                "districtId": nc["districtId"],
                "photo": None,
                "source": source,
                "declaredAssets": nc.get("declaredAssets", 0),
                "pendingCriminalCases": nc.get("pendingCriminalCases", 0),
                "localIssues": nc.get("localIssues", []),
                "education": nc.get("education", ""),
                "age": nc.get("age", 0),
                "lastUpdated": today,
            }
            existing.append(candidate)
            group_index.setdefault(group_key, []).append(len(existing) - 1)
            added += 1

    print(f"  Added {added} new, updated {updated} existing")
    return existing


# ══════════════════════════════════════════════════════
# Main Pipeline
# ══════════════════════════════════════════════════════

def main():
    args = sys.argv[1:]
    skip_news = "--skip-news" in args
    skip_profiles = "--skip-profiles" in args

    print("=" * 60)
    print("  Know Your Leader — Data Update Pipeline v2 (2026 Ready)")
    print("=" * 60)
    print()

    # ── Step 1 ──
    print("[1/5] Loading district/constituency data...")
    load_valid_locations()
    print(f"  {len(VALID_DISTRICTS)} districts, {len(VALID_CONSTITUENCIES)} constituencies\n")

    # ── Step 2 ──
    print("[2/5] Scraping MyNeta.info for ECI data...")
    myneta_candidates = scrape_myneta_data(fetch_profiles=not skip_profiles)
    print()

    # ── Step 3 & 4 ──
    news_candidates = []
    if not skip_news:
        print("[3/5] Fetching RSS news feeds...")
        articles = fetch_articles()
        print()

        print("[4/5] Extracting candidate data from news...")
        news_candidates = extract_via_openrouter(articles)
        if not news_candidates and articles:
            news_candidates = extract_via_rules(articles)
        print(f"  Total from news: {len(news_candidates)} candidates\n")
    else:
        print("[3/5] Skipping news feeds (--skip-news)\n")
        print("[4/5] Skipping news extraction\n")

    # ── Step 5 ──
    print("[5/5] Deduplicating, merging and saving...")
    with open(CANDIDATES_FILE, "r", encoding="utf-8") as f:
        existing = json.load(f)

    # First, deduplicate existing data
    existing = dedup_existing(existing)

    # Then merge new candidates
    all_new = myneta_candidates + news_candidates
    merged = merge_candidates(existing, all_new)

    with open(CANDIDATES_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"  Total candidates in database: {len(merged)}\n")

    # ── Summary ──
    print("─" * 60)
    print("  Pipeline Summary:")
    print(f"  • MyNeta ECI profiles: {len(myneta_candidates)}")
    print(f"  • News candidates:     {len(news_candidates)}")
    print(f"  • Database total:      {len(merged)}")
    if not OPENROUTER_API_KEY and not skip_news:
        print()
        print("  💡 TIP: Set OPENROUTER_API_KEY for better news extraction")
        print("     Free at: https://openrouter.ai")
    print("─" * 60)
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
