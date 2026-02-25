"""
Know Your Leader — Data Update Pipeline v2
============================================
A robust, multi-source pipeline to populate candidate data from REAL sources.

Data Sources (in priority order):
  1. MyNeta.info — ECI affidavit data (assets, cases, education) for incumbents
  2. RSS News Feeds — Tamil Nadu election news
  3. Google Gemini Free Tier — For intelligent extraction from news (5 RPM, free)
  4. Rule-based fallback — Pattern matching when no LLM is available

Usage:
    python scripts/update_data.py

Environment Variables (optional):
    GEMINI_API_KEY     — Google AI Studio key (free at https://aistudio.google.com/apikey)
    OPENROUTER_API_KEY — OpenRouter key (fallback, heavily rate-limited on free tier)

Designed to run via GitHub Actions on a daily cron schedule.
"""

import json
import os
import re
import sys
import time
import html
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

try:
    import feedparser
    import requests
except ImportError:
    print("Installing dependencies...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "feedparser", "requests"])
    import feedparser
    import requests


# ──────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────

# API Keys
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCOFmn28jQhsvv4eo99BxpVyeyJPn616ms")
OPENROUTER_API_KEY = os.environ.get(
    "OPENROUTER_API_KEY",
    "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",
)

# Gemini (PRIMARY — 5 RPM free, very reliable)
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# OpenRouter (FALLBACK — heavily rate-limited on free tier)
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

# MyNeta (Association for Democratic Reforms — official ECI data)
MYNETA_BASE_URL = "https://myneta.info"
MYNETA_TN_2021_URL = f"{MYNETA_BASE_URL}/TamilNadu2021"

# Paths
DATA_DIR = Path(__file__).parent.parent / "data"
CANDIDATES_FILE = DATA_DIR / "candidates.json"
DISTRICTS_FILE = DATA_DIR / "districts.json"

# Valid locations (loaded at startup)
VALID_DISTRICTS: set[str] = set()
VALID_CONSTITUENCIES: set[str] = set()
CONSTITUENCY_NAME_TO_ID: dict[str, str] = {}
DISTRICT_NAME_TO_ID: dict[str, str] = {}

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

# Keywords for rule-based extraction
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
    global VALID_DISTRICTS, VALID_CONSTITUENCIES, CONSTITUENCY_NAME_TO_ID, DISTRICT_NAME_TO_ID
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
            # Also map without hyphens/spaces for fuzzy matching
            clean = c["name"].lower().replace(" ", "").replace("-", "")
            CONSTITUENCY_NAME_TO_ID[clean] = c["id"]


# ══════════════════════════════════════════════════════
# SOURCE 1: MyNeta.info — ECI Verified Data
# ══════════════════════════════════════════════════════

def scrape_myneta_incumbents() -> list[dict]:
    """
    Scrape 2021 TN election winners from MyNeta.info (public ECI data).
    These are current incumbents who may re-contest in 2026.
    Returns verified candidate data with assets, cases, education.
    
    Uses the winners summary page (paginated, 3 pages of ~75 winners each).
    """
    candidates = []
    
    # Browser-like headers to avoid 403/404 blocks
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
    }

    # The winners summary page is paginated (3 pages for 224 winners)
    for page_num in range(1, 4):
        url = (
            f"{MYNETA_BASE_URL}/TamilNadu2021/index.php"
            f"?action=summary&subAction=winner_analyzed&sort=default&page={page_num}"
        )
        print(f"  Fetching winners page {page_num}/3...")

        try:
            resp = requests.get(url, headers=headers, timeout=30)
            resp.raise_for_status()
            page_html = resp.text

            # Parse HTML table rows
            # MyNeta summary tables have columns:
            # S.No | Candidate | Constituency | Party | Criminal Cases | Education | Total Assets | Liabilities
            rows = re.findall(
                r'<tr[^>]*>(.*?)</tr>',
                page_html,
                re.DOTALL | re.IGNORECASE,
            )

            page_count = 0
            for row in rows:
                cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL | re.IGNORECASE)
                if len(cells) < 7:
                    continue

                # Clean HTML tags from cell content
                def clean(cell_html: str) -> str:
                    text = re.sub(r'<[^>]+>', ' ', cell_html)
                    text = html.unescape(text).strip()
                    return re.sub(r'\s+', ' ', text)

                # Column mapping for MyNeta summary table
                sno = clean(cells[0])
                # Skip header rows
                if not sno or not sno[0].isdigit():
                    continue

                name = clean(cells[1])
                constituency_raw = clean(cells[2])
                party_raw = clean(cells[3])
                cases_raw = clean(cells[4])
                education_raw = clean(cells[5])
                assets_raw = clean(cells[6])

                if not name or len(name) < 2:
                    continue

                # Match constituency to our data
                constituency_id = _match_constituency(constituency_raw)
                district_id = _find_district_for_constituency(constituency_id) if constituency_id else None

                if not constituency_id or not district_id:
                    continue

                # Parse assets (MyNeta format: "Rs 1,23,45,678" or "1 Crore+")
                assets = _parse_indian_number(assets_raw)

                # Parse criminal cases
                try:
                    cases_digits = re.sub(r'[^\d]', '', cases_raw)
                    cases = int(cases_digits) if cases_digits else 0
                except ValueError:
                    cases = 0

                candidates.append({
                    "name": name,
                    "nameTamil": "",
                    "party": _normalize_party(party_raw),
                    "constituencyId": constituency_id,
                    "districtId": district_id,
                    "source": "official",
                    "declaredAssets": assets,
                    "pendingCriminalCases": cases,
                    "education": education_raw,
                    "localIssues": [],
                    "age": 0,
                })
                page_count += 1

            print(f"    Page {page_num}: found {page_count} winners")
            time.sleep(1)  # Be polite to the server

        except requests.RequestException as e:
            print(f"  Warning: MyNeta page {page_num} failed: {e}")
            continue

    print(f"  Total scraped: {len(candidates)} incumbent MLAs from MyNeta.info")

    if not candidates:
        print("  Note: MyNeta scraping returned 0 results.")
        print("  This can happen if MyNeta changes their HTML structure.")
        print("  Other data sources will still populate the database.")

    return candidates


def _match_constituency(name: str) -> str | None:
    """Fuzzy match constituency name to our IDs."""
    name_lower = name.lower().strip()
    if name_lower in CONSTITUENCY_NAME_TO_ID:
        return CONSTITUENCY_NAME_TO_ID[name_lower]
    # Try without spaces/hyphens
    clean = name_lower.replace(" ", "").replace("-", "")
    if clean in CONSTITUENCY_NAME_TO_ID:
        return CONSTITUENCY_NAME_TO_ID[clean]
    # Partial match
    for known_name, cid in CONSTITUENCY_NAME_TO_ID.items():
        if known_name in name_lower or name_lower in known_name:
            return cid
    return None


def _find_district_for_constituency(constituency_id: str) -> str | None:
    """Find which district a constituency belongs to."""
    with open(DISTRICTS_FILE, "r", encoding="utf-8") as f:
        districts = json.load(f)
    for d in districts:
        for c in d["constituencies"]:
            if c["id"] == constituency_id:
                return d["id"]
    return None


def _parse_indian_number(text: str) -> int:
    """Parse Indian-style numbers like 'Rs 1,23,45,678' or '₹ 12.5 Cr'."""
    text = text.replace("Rs", "").replace("₹", "").replace("~", "").strip()
    if "cr" in text.lower():
        match = re.search(r'([\d.]+)', text)
        return int(float(match.group(1)) * 10_000_000) if match else 0
    if "lakh" in text.lower() or "lac" in text.lower():
        match = re.search(r'([\d.]+)', text)
        return int(float(match.group(1)) * 100_000) if match else 0
    digits = re.sub(r'[^\d]', '', text)
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
                # Clean HTML from summary
                summary = re.sub(r'<[^>]+>', '', summary)
                summary = html.unescape(summary).strip()

                articles.append({
                    "title": title,
                    "summary": summary[:500],  # Limit length
                    "link": entry.get("link", ""),
                    "published": entry.get("published", ""),
                })
        except Exception as e:
            print(f"  Warning: Failed to fetch {feed_url}: {e}")

    # Filter for election-relevant articles
    relevant = []
    for a in articles:
        text = (a["title"] + " " + a["summary"]).lower()
        has_party = any(kw.lower() in text for kw in PARTY_KEYWORDS)
        has_election = any(kw.lower() in text for kw in ELECTION_KEYWORDS)
        # Include if it mentions both a party AND election-related term
        if has_party and has_election:
            relevant.append(a)
        # Also include if it mentions "tamil nadu" + "election"
        elif "tamil nadu" in text and "election" in text:
            relevant.append(a)

    print(f"  Total articles fetched: {len(articles)}, election-relevant: {len(relevant)}")
    return relevant if relevant else articles[:10]  # Fallback to first 10 if no relevant found


# ══════════════════════════════════════════════════════
# SOURCE 3a: Google Gemini Free Tier (PRIMARY LLM)
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


def extract_via_gemini(articles: list[dict]) -> list[dict]:
    """Extract candidates using Google Gemini free tier (5 RPM)."""
    if not GEMINI_API_KEY:
        print("  No GEMINI_API_KEY set. Skipping Gemini extraction.")
        print("  Get a free key at: https://aistudio.google.com/apikey")
        return []

    print("  Using Google Gemini 2.0 Flash (free tier, 5 RPM)...")
    extracted = []

    # Process all articles in ONE batch (Gemini handles larger contexts well)
    articles_text = "\n\n---\n\n".join(
        f"Title: {a['title']}\nSummary: {a['summary']}\nDate: {a['published']}"
        for a in articles[:15]  # Limit to 15 articles per call
    )

    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [{
                "text": EXTRACTION_PROMPT.format(articles=articles_text)
            }]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 4096,
        },
    }

    # Retry with exponential backoff (free tier = 5 RPM)
    max_attempts = 4
    wait_times = [15, 30, 60, 90]

    for attempt in range(max_attempts):
        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=60,
            )

            if response.status_code == 429:
                wait = wait_times[min(attempt, len(wait_times) - 1)]
                remaining = max_attempts - attempt - 1
                print(f"  Gemini rate limited (429). Waiting {wait}s... (attempt {attempt+1}/{max_attempts}, {remaining} retries left)")
                time.sleep(wait)
                continue

            response.raise_for_status()
            result = response.json()

            # Extract text from Gemini response
            content = result["candidates"][0]["content"]["parts"][0]["text"]

            # Parse JSON array from response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                candidates = json.loads(json_match.group())
                extracted.extend(candidates)
                print(f"  Gemini extracted {len(candidates)} candidates")
            else:
                print("  Gemini: No candidates found in articles (this is normal if no election news)")
            return extracted

        except requests.exceptions.HTTPError as e:
            print(f"  Gemini HTTP error: {e}")
            break
        except (KeyError, json.JSONDecodeError) as e:
            print(f"  Gemini parse error: {e}")
            break
        except Exception as e:
            print(f"  Gemini error: {e}")
            break

    if not extracted:
        print("  Gemini: All retries exhausted. Will fall through to next source.")
    return extracted



# ══════════════════════════════════════════════════════
# SOURCE 3b: OpenRouter (FALLBACK LLM)
# ══════════════════════════════════════════════════════

def extract_via_openrouter(articles: list[dict]) -> list[dict]:
    """Extract candidates using OpenRouter (fallback, aggressive rate limits)."""
    if not OPENROUTER_API_KEY:
        print("  No OPENROUTER_API_KEY set. Skipping.")
        return []

    print("  Using OpenRouter Llama 3.3 (free tier — may be slow)...")
    print("  Note: Free tier is heavily rate-limited. Sending ONE batch only.")
    extracted = []

    # Send ONLY ONE request to avoid 429 (free tier ~1 RPM)
    articles_text = "\n\n---\n\n".join(
        f"Title: {a['title']}\nSummary: {a['summary']}"
        for a in articles[:5]  # Only 5 articles to keep it small
    )

    for attempt in range(3):
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
                wait = 30 * (attempt + 1)
                print(f"  Rate limited (429). Waiting {wait}s... (attempt {attempt+1}/3)")
                time.sleep(wait)
                continue

            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]

            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                candidates = json.loads(json_match.group())
                extracted.extend(candidates)
                print(f"  OpenRouter extracted {len(candidates)} candidates")
            else:
                print("  OpenRouter: No candidates found in articles")
            break

        except requests.exceptions.HTTPError as e:
            if "429" in str(e):
                wait = 30 * (attempt + 1)
                print(f"  Rate limited. Waiting {wait}s... (attempt {attempt+1}/3)")
                time.sleep(wait)
            else:
                print(f"  OpenRouter error: {e}")
                break
        except Exception as e:
            print(f"  OpenRouter error: {e}")
            break

    return extracted


# ══════════════════════════════════════════════════════
# SOURCE 3c: Rule-Based Extraction (NO API NEEDED)
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

        # Find party mentions
        parties_found = [p for p in PARTY_KEYWORDS if p.lower() in text.lower()]

        # Find constituency mentions
        constituencies_found = []
        for name, cid in CONSTITUENCY_NAME_TO_ID.items():
            if name and len(name) > 2 and name in text.lower():
                constituencies_found.append(cid)

        # Find district mentions
        districts_found = []
        for name, did in DISTRICT_NAME_TO_ID.items():
            if name and len(name) > 2 and name in text.lower():
                districts_found.append(did)

        # Extract quoted names or "Mr./Ms./Dr." patterns as potential candidate names
        name_patterns = [
            r'(?:Mr\.|Ms\.|Mrs\.|Dr\.|Thiru\.|Selvi\.|Selvan\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
            r'"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)"',
            r"'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'",
        ]

        names_found = []
        for pattern in name_patterns:
            matches = re.findall(pattern, text)
            names_found.extend(matches)

        # Only create candidates if we have meaningful data
        if names_found and parties_found and (constituencies_found or districts_found):
            for name in names_found[:2]:  # Max 2 per article
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
# Validation & Merge
# ══════════════════════════════════════════════════════

def validate_candidate(candidate: dict) -> bool:
    """Validate that a candidate has required fields and valid location."""
    required = ["name", "party", "constituencyId", "districtId"]
    for field in required:
        if not candidate.get(field):
            return False

    if candidate["districtId"] not in VALID_DISTRICTS:
        # Try to match by name
        dist_id = DISTRICT_NAME_TO_ID.get(candidate["districtId"].lower())
        if dist_id:
            candidate["districtId"] = dist_id
        else:
            return False

    if candidate["constituencyId"] not in VALID_CONSTITUENCIES:
        # Try to match by name
        con_id = _match_constituency(candidate["constituencyId"])
        if con_id:
            candidate["constituencyId"] = con_id
        else:
            return False

    return True


def merge_candidates(existing: list[dict], new_candidates: list[dict]) -> list[dict]:
    """Merge new candidates into existing data. Avoid duplicates."""
    existing_keys = {
        (c["name"].lower().strip(), c["constituencyId"]): i
        for i, c in enumerate(existing)
    }

    today = datetime.now().strftime("%Y-%m-%d")
    added = 0
    updated = 0

    for nc in new_candidates:
        if not validate_candidate(nc):
            continue

        key = (nc["name"].lower().strip(), nc["constituencyId"])
        source = nc.get("source", "news")

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

        if key in existing_keys:
            idx = existing_keys[key]
            # Update with new data (prefer non-zero values)
            if candidate["declaredAssets"] > 0:
                existing[idx]["declaredAssets"] = candidate["declaredAssets"]
            if candidate["pendingCriminalCases"] > 0:
                existing[idx]["pendingCriminalCases"] = candidate["pendingCriminalCases"]
            if candidate["localIssues"]:
                merged_issues = list(set(existing[idx].get("localIssues", []) + candidate["localIssues"]))
                existing[idx]["localIssues"] = merged_issues
            if candidate["education"] and not existing[idx].get("education"):
                existing[idx]["education"] = candidate["education"]
            # Upgrade source from "news" to "official" if we have verified data
            if source == "official":
                existing[idx]["source"] = "official"
            existing[idx]["lastUpdated"] = today
            updated += 1
        else:
            existing.append(candidate)
            added += 1

    print(f"  Added {added} new candidates, updated {updated} existing")
    return existing


# ══════════════════════════════════════════════════════
# Main Pipeline
# ══════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  Know Your Leader — Data Update Pipeline v2")
    print("=" * 60)
    print()

    # ── Step 1: Load locations ────────────────────────
    print("[1/5] Loading district/constituency data...")
    load_valid_locations()
    print(f"  {len(VALID_DISTRICTS)} districts, {len(VALID_CONSTITUENCIES)} constituencies")
    print()

    # ── Step 2: Scrape MyNeta.info for incumbents ─────
    print("[2/5] Scraping MyNeta.info for incumbent ECI data...")
    myneta_candidates = scrape_myneta_incumbents()
    print()

    # ── Step 3: Fetch RSS news feeds ──────────────────
    print("[3/5] Fetching RSS news feeds...")
    articles = fetch_articles()
    print()

    # ── Step 4: Extract from news (LLM or rules) ─────
    print("[4/5] Extracting candidate data from news...")
    news_candidates = []

    # Try Gemini first (best free option: 5 RPM)
    if GEMINI_API_KEY:
        news_candidates = extract_via_gemini(articles)

    # Fallback to OpenRouter if Gemini didn't work
    if not news_candidates and OPENROUTER_API_KEY:
        news_candidates = extract_via_openrouter(articles)

    # Last resort: rule-based extraction (always works, no API)
    if not news_candidates and articles:
        news_candidates = extract_via_rules(articles)

    print(f"  Total from news: {len(news_candidates)} candidates")
    print()

    # ── Step 5: Merge and save ────────────────────────
    print("[5/5] Merging and saving...")
    with open(CANDIDATES_FILE, "r", encoding="utf-8") as f:
        existing = json.load(f)

    all_new = myneta_candidates + news_candidates
    merged = merge_candidates(existing, all_new)

    with open(CANDIDATES_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"  Total candidates in database: {len(merged)}")
    print()

    # Summary
    print("─" * 60)
    print("  Pipeline Summary:")
    print(f"  • MyNeta incumbents scraped: {len(myneta_candidates)}")
    print(f"  • News candidates extracted: {len(news_candidates)}")
    print(f"  • LLM used: {'Gemini' if GEMINI_API_KEY and news_candidates else 'OpenRouter' if news_candidates else 'Rule-based (no API)'}")
    print(f"  • Database total: {len(merged)}")
    if not GEMINI_API_KEY:
        print()
        print("  💡 TIP: Get a FREE Gemini API key for better extraction:")
        print("     https://aistudio.google.com/apikey")
        print("     Then set: GEMINI_API_KEY=your_key_here")
    print("─" * 60)
    print()
    print("Done!")


if __name__ == "__main__":
    main()
