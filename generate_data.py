"""
generate_data.py
Reads Final_Cleaned_Candidates_Data.xlsx (2021 potential candidates)
and (2026 Official Candidate List).csv (NTK official candidates),
then merges them into data/candidates.json.

IMPORTANT: This script NEVER modifies the xlsx or csv source files.
"""

import json
import os
import re
import sys
import pandas as pd
from difflib import SequenceMatcher

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")

# -- Paths -------------------------------------------------------------------
ROOT = os.path.dirname(os.path.abspath(__file__))
XLSX_PATH = os.path.join(ROOT, "Final_Cleaned_Candidates_Data.xlsx")
CSV_PATH  = os.path.join(ROOT, "(2026 Official Candidate List).csv")
DISTRICTS_JSON = os.path.join(ROOT, "data", "districts.json")
OUTPUT_JSON    = os.path.join(ROOT, "data", "candidates.json")

MYNETA_BASE = "https://myneta.info/TamilNadu2021/"

# -- Manual constituency alias map ------------------------------------------
# XLSX name (uppercase, without SC/ST suffix) -> districts.json name
CONSTITUENCY_ALIASES = {
    "MADHAVARAM":           "Madavaram",
    "MADAVARAM":            "Madavaram",
    "PANRUTI":              "Panruti",
    "VIRALIMALAI":          "Viralimalai",
    "KATPADI":              "Katpadi",
    "MANACHANALLUR":        "Manachanallur",
    "TITTAKUDI":            "Tittagudi",
    "NEYVELI":              "Neyveli",
    "THIRUVIDAIMARUDUR":    "Thiruvidaimarudur",
    "THALLY":               "Thalli",
    "PAPPIREDDIPATTI":      "Pappireddippatti",
    "THIRUTHURAIPOONDI":    "Thiruthuraipoondi",
    "KANNIYAKUMARI":        "Kanniyakumari",
    "BODINAYAKKANUR":       "Bodinayakanur",
    "ARUPPUKOTTAI":         "Aruppukkottai",
    "COLACHAL":             "Colachel",
    "KUMARAPALAYAM":        "Kumarapalayam",
    "DR.RADHAKRISHNAN NAGAR": "Dr. Radhakrishnan Nagar",
    "PARAMATHIVELUR":       "Paramathi Velur",
    "RASIPURAM":            "Rasipuram",
    "SENTHAMANGALAM":       "Senthamangalam",
    "SHOLINGHUR":           "Sholingur",
    "THIRUMANGALAM":        "Thirumangalam",
    "THIRUVALLUR":          "Tiruvallur",
    "THIRUVAUR":            "Thiruvarur",
    "THIRUVERUMBUR":        "Thiruverumbur",
    "THIRUVOTTIYUR":        "Thiruvottiyur",
    "TIRUCHENGODU":         "Tiruchengode",
    "TIRUKKOYILUR":         "Tirukovilur",
    "TIRUPATTUR":           "Tirupathur",
    "TIRUPPATHUR":          "Thiruppathur",
    "VEDHARANYAM":          "Vedaranyam",
    "VIRUGAMPAKKAM":        "Virugambakkam",
    "VRIDHACHALAM":         "Virudhachalam",
    "KANGAYAM":             "Kangeyam",
    "CHEYYAR":              "Cheyyar",
    "MADHURAVOYAL":         "Maduravoyal",
}

# -- Party abbreviation mapping (XLSX uses full names) -----------------------
PARTY_ABBR = {
    "naam tamilar katchi": "NTK",
    "makkal needhi maiam": "MNM",
    "puthiya tamilagam": "PT",
    "amma makkal munnettra kazagam": "AMMK",
    "all india majlis-e-ittehadul muslimeen": "AIMIM",
    "viduthalai chiruthaigal katchi": "VCK",
    "cpi(ml)(l)": "CPI(ML)(L)",
    "ambedkarite party of india": "API",
}

KNOWN_ABBRS = {"DMK", "AIADMK", "BJP", "INC", "NTK", "PMK", "DMDK", "MNM",
               "VCK", "CPI", "CPM", "MDMK", "IUML", "BSP", "NCP", "AMMK",
               "IND", "SDPI", "TVK"}

PARTY_COLORS = {
    "DMK":    "#E31E24",
    "AIADMK": "#006B3F",
    "BJP":    "#FF6B00",
    "PMK":    "#FFD700",
    "INC":    "#19AAED",
    "NTK":    "#8B0000",
    "VCK":    "#888888",
    "MNM":    "#4B0082",
    "DMDK":   "#FFAA00",
    "CPI":    "#FF0000",
    "CPM":    "#CC0000",
    "MDMK":   "#00AA00",
    "IUML":   "#006400",
    "AMMK":   "#800080",
    "TVK":    "#0044CC",
    "BSP":    "#0000FF",
    "NCP":    "#008000",
    "IND":    "#999999",
}

# -- Helpers -----------------------------------------------------------------

def normalize(name: str) -> str:
    """Lowercase, strip, collapse whitespace, remove punctuation for matching."""
    name = name.lower().strip()
    name = re.sub(r"[^a-z0-9\s]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name


def strip_sc_st(name: str) -> str:
    """Remove (SC), (ST) suffixes from constituency names."""
    return re.sub(r"\s*\((?:SC|ST)\)\s*$", "", name, flags=re.IGNORECASE).strip()


def normalize_constituency(name: str) -> str:
    """Normalize constituency name: strip SC/ST, lowercase, remove spaces/hyphens/parens."""
    name = strip_sc_st(name)
    name = name.lower().strip()
    name = re.sub(r"[\s\-\(\)\.]+", "", name)
    return name


def parse_assets(val) -> int:
    """Parse 'Rs 80,90,000 ~ 80 Lacs+' => 8090000"""
    if pd.isna(val):
        return 0
    s = str(val)
    m = re.search(r"Rs\s+([\d,]+)", s)
    if m:
        return int(m.group(1).replace(",", ""))
    try:
        return int(float(str(val).replace(",", "")))
    except (ValueError, TypeError):
        return 0


def get_party_abbr(full_name: str) -> str:
    """Map a full party name to its abbreviation."""
    if not full_name or pd.isna(full_name):
        return "IND"
    upper = full_name.strip().upper()
    if upper in KNOWN_ABBRS:
        return upper
    lower = full_name.strip().lower()
    if lower in PARTY_ABBR:
        return PARTY_ABBR[lower]
    return full_name.strip()


def get_party_color(abbr: str) -> str:
    return PARTY_COLORS.get(abbr, "#999999")


def fuzzy_match_score(name1: str, name2: str) -> float:
    return SequenceMatcher(None, normalize(name1), normalize(name2)).ratio()


# -- Main --------------------------------------------------------------------

def main():
    # 1. Load districts.json to build constituency lookup
    with open(DISTRICTS_JSON, "r", encoding="utf-8") as f:
        districts = json.load(f)

    # Build lookup: normalized_name -> {id, name, nameTamil, districtId}
    const_lookup = {}
    const_list = []
    for dist in districts:
        for c in dist["constituencies"]:
            key = normalize_constituency(c["name"])
            entry = {
                "id": c["id"],
                "name": c["name"],
                "nameTamil": c.get("nameTamil", ""),
                "districtId": dist["id"],
            }
            const_lookup[key] = entry
            const_list.append((key, entry))

    # Also register manual aliases into the lookup
    for alias_upper, target_name in CONSTITUENCY_ALIASES.items():
        alias_key = normalize_constituency(alias_upper)
        target_key = normalize_constituency(target_name)
        if target_key in const_lookup:
            const_lookup[alias_key] = const_lookup[target_key]
        else:
            # The target itself might not exist, try fuzzy
            best, best_score = None, 0
            for ckey, centry in const_list:
                score = SequenceMatcher(None, target_key, ckey).ratio()
                if score > best_score:
                    best_score = score
                    best = centry
            if best and best_score >= 0.70:
                const_lookup[alias_key] = best

    def resolve_constituency(raw_name: str):
        """Resolve a raw constituency name via alias, exact, then fuzzy match."""
        # Try alias first (strip SC/ST, uppercase)
        stripped = strip_sc_st(raw_name).upper()
        if stripped in CONSTITUENCY_ALIASES:
            target = CONSTITUENCY_ALIASES[stripped]
            tkey = normalize_constituency(target)
            if tkey in const_lookup:
                return const_lookup[tkey]

        key = normalize_constituency(raw_name)
        if key in const_lookup:
            return const_lookup[key]

        # Fuzzy fallback
        best, best_score = None, 0
        for ckey, centry in const_list:
            score = SequenceMatcher(None, key, ckey).ratio()
            if score > best_score:
                best_score = score
                best = centry
        if best_score >= 0.75:
            return best
        return None

    # 2. Read XLSX (2021 potential candidates)
    print("Reading XLSX...")
    xlsx_df = pd.read_excel(XLSX_PATH)
    print(f"  => {len(xlsx_df)} rows from XLSX")

    # Index XLSX by normalized constituency name for quick lookup
    # We use BOTH the raw normalized key AND the alias-resolved key
    xlsx_by_constituency = {}
    for _, row in xlsx_df.iterrows():
        raw_const = str(row.get("Constituency", "")).strip()
        norm_const = normalize_constituency(raw_const)
        if norm_const not in xlsx_by_constituency:
            xlsx_by_constituency[norm_const] = []
        xlsx_by_constituency[norm_const].append(row)

        # Also index by alias-resolved key
        stripped = strip_sc_st(raw_const).upper()
        if stripped in CONSTITUENCY_ALIASES:
            alias_key = normalize_constituency(CONSTITUENCY_ALIASES[stripped])
            if alias_key != norm_const:
                if alias_key not in xlsx_by_constituency:
                    xlsx_by_constituency[alias_key] = []
                xlsx_by_constituency[alias_key].append(row)

    # 3. Build potential candidates from XLSX
    print("Building potential candidates from XLSX...")
    candidates = []
    seen_ids = set()
    counter = 0
    unmapped_constituencies = set()

    for _, row in xlsx_df.iterrows():
        raw_const = str(row.get("Constituency", "")).strip()
        const_entry = resolve_constituency(raw_const)
        if not const_entry:
            unmapped_constituencies.add(raw_const)
            continue

        name = str(row.get("Candidate Name", "")).strip()
        party_abbr = get_party_abbr(str(row.get("Party", "IND")))
        link = str(row.get("Link", "")).strip()
        source_url = MYNETA_BASE + link if link and link != "nan" else ""
        assets = parse_assets(row.get("Total Assets"))
        cases = int(row.get("Criminal Case", 0)) if not pd.isna(row.get("Criminal Case")) else 0
        education = str(row.get("Education", "Not Available")).strip()
        if education == "nan":
            education = "Not Available"

        counter += 1
        cand_id = f"cand-{counter}"
        while cand_id in seen_ids:
            counter += 1
            cand_id = f"cand-{counter}"
        seen_ids.add(cand_id)

        candidates.append({
            "id": cand_id,
            "name": name,
            "nameTamil": "",
            "party": party_abbr,
            "partyColor": get_party_color(party_abbr),
            "constituencyId": const_entry["id"],
            "districtId": const_entry["districtId"],
            "photo": None,
            "source": "potential",
            "sourceUrl": source_url,
            "declaredAssets": assets,
            "pendingCriminalCases": cases,
            "localIssues": [],
            "education": education,
            "age": 0,
            "lastUpdated": "2021-04-06",
        })

    if unmapped_constituencies:
        print(f"  [WARN] Could not map {len(unmapped_constituencies)} constituency names:")
        for uc in sorted(unmapped_constituencies):
            print(f"    - {uc}")
    print(f"  => {len(candidates)} potential candidates created")

    # 4. Read CSV (2026 official NTK candidates)
    print("\nReading CSV...")
    csv_lines = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Skip header rows (first 2 are title/header)
    for line in lines[2:]:
        line = line.strip()
        if not line:
            continue
        parts = line.split(",")
        entry = parts[0].strip()
        if "|" not in entry:
            continue
        name_part, const_part = entry.split("|", 1)
        name = name_part.strip()
        const_part = const_part.strip()
        m = re.match(r"\d+\s*-\s*(.+)", const_part)
        if m:
            raw_const = m.group(1).strip()
        else:
            raw_const = const_part
        csv_lines.append((name, raw_const))

    print(f"  => {len(csv_lines)} official candidates from CSV")

    # 5. For each CSV candidate, fuzzy-match against XLSX to inherit data
    #    When a match is found, UPGRADE the existing "potential" entry to "official"
    #    instead of creating a duplicate entry.
    print("\nMatching CSV candidates to XLSX data...")
    matched = 0
    upgraded = 0
    unmatched_names = []

    # Build an index of existing candidates by (constituencyId, normalized_name)
    # so we can find and upgrade duplicates in-place
    potential_index = {}  # (constituencyId, norm_name) -> index in candidates list
    for idx, cand in enumerate(candidates):
        key = (cand["constituencyId"], normalize(cand["name"]))
        potential_index[key] = idx

    for csv_name, csv_const in csv_lines:
        const_entry = resolve_constituency(csv_const)
        if not const_entry:
            print(f"  [WARN] Could not map CSV constituency: {csv_const}")
            continue

        # Find XLSX candidates in the same constituency
        norm_const = normalize_constituency(csv_const)
        xlsx_rows = xlsx_by_constituency.get(norm_const, [])

        # Also try alias-resolved key
        if not xlsx_rows:
            stripped = strip_sc_st(csv_const).upper()
            if stripped in CONSTITUENCY_ALIASES:
                alias_key = normalize_constituency(CONSTITUENCY_ALIASES[stripped])
                xlsx_rows = xlsx_by_constituency.get(alias_key, [])

        # Fuzzy constituency fallback
        if not xlsx_rows:
            best_ckey, best_cscore = None, 0
            for ckey in xlsx_by_constituency:
                score = SequenceMatcher(None, norm_const, ckey).ratio()
                if score > best_cscore:
                    best_cscore = score
                    best_ckey = ckey
            if best_ckey and best_cscore >= 0.75:
                xlsx_rows = xlsx_by_constituency[best_ckey]

        # Find best name match among candidates in that constituency
        best_row = None
        best_score = 0
        for xrow in xlsx_rows:
            xname = str(xrow.get("Candidate Name", ""))
            score = fuzzy_match_score(csv_name, xname)
            if score > best_score:
                best_score = score
                best_row = xrow

        if best_row is not None and best_score >= 0.80:
            # MATCH FOUND — upgrade the existing "potential" entry to "official"
            link = str(best_row.get("Link", "")).strip()
            source_url = MYNETA_BASE + link if link and link != "nan" else ""
            assets = parse_assets(best_row.get("Total Assets"))
            cases = int(best_row.get("Criminal Case", 0)) if not pd.isna(best_row.get("Criminal Case")) else 0
            education = str(best_row.get("Education", "Not Available")).strip()
            if education == "nan":
                education = "Not Available"
            matched += 1
            print(f"  [MATCH {best_score:.2f}] CSV: '{csv_name}' <=> XLSX: '{best_row['Candidate Name']}'")

            # Try to find and upgrade the existing potential entry
            xlsx_name = str(best_row.get("Candidate Name", "")).strip()
            pot_key = (const_entry["id"], normalize(xlsx_name))
            if pot_key in potential_index:
                idx = potential_index[pot_key]
                candidates[idx]["name"] = csv_name  # use the official CSV name
                candidates[idx]["party"] = "NTK"
                candidates[idx]["partyColor"] = get_party_color("NTK")
                candidates[idx]["source"] = "official"
                candidates[idx]["lastUpdated"] = "2026-03-04"
                upgraded += 1
                print(f"    -> Upgraded existing potential entry (cand ID: {candidates[idx]['id']})")
                continue  # no new entry needed
            else:
                # No existing entry found to upgrade; add as new official
                counter += 1
                cand_id = f"cand-{counter}"
                while cand_id in seen_ids:
                    counter += 1
                    cand_id = f"cand-{counter}"
                seen_ids.add(cand_id)

                candidates.append({
                    "id": cand_id,
                    "name": csv_name,
                    "nameTamil": "",
                    "party": "NTK",
                    "partyColor": get_party_color("NTK"),
                    "constituencyId": const_entry["id"],
                    "districtId": const_entry["districtId"],
                    "photo": None,
                    "source": "official",
                    "sourceUrl": source_url,
                    "declaredAssets": assets,
                    "pendingCriminalCases": cases,
                    "localIssues": [],
                    "education": education,
                    "age": 0,
                    "lastUpdated": "2026-03-04",
                })
        else:
            # NO MATCH — add as a brand new official candidate
            source_url = ""
            assets = 0
            cases = 0
            education = "Not Available"
            unmatched_names.append(csv_name)
            if best_row is not None:
                print(f"  [LOW   {best_score:.2f}] CSV: '{csv_name}' vs XLSX: '{best_row['Candidate Name']}' (no match)")
            else:
                print(f"  [NONE] CSV: '{csv_name}' in '{csv_const}' -- no XLSX candidates found")

            counter += 1
            cand_id = f"cand-{counter}"
            while cand_id in seen_ids:
                counter += 1
                cand_id = f"cand-{counter}"
            seen_ids.add(cand_id)

            candidates.append({
                "id": cand_id,
                "name": csv_name,
                "nameTamil": "",
                "party": "NTK",
                "partyColor": get_party_color("NTK"),
                "constituencyId": const_entry["id"],
                "districtId": const_entry["districtId"],
                "photo": None,
                "source": "official",
                "sourceUrl": source_url,
                "declaredAssets": assets,
                "pendingCriminalCases": cases,
                "localIssues": [],
                "education": education,
                "age": 0,
                "lastUpdated": "2026-03-04",
            })

    # 5.5 Deduplication Sweep
    print("\nPerforming Deduplication Sweep...")
    official_keys = set()
    for c in candidates:
        if c["source"] == "official":
            official_keys.add((c["party"], c["constituencyId"]))
    
    new_candidates = []
    dedup_removed = 0
    for c in candidates:
        if c["source"] in ["potential", "news"]:
            key = (c["party"], c["constituencyId"])
            if key in official_keys:
                dedup_removed += 1
                continue
        new_candidates.append(c)
        
    candidates = new_candidates
    print(f"  => Removed {dedup_removed} orphaned potential candidates")

    # 6. Summary
    potential_count = sum(1 for c in candidates if c["source"] == "potential")
    official_count  = sum(1 for c in candidates if c["source"] == "official")
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total candidates: {len(candidates)}")
    print(f"  Potential (2021): {potential_count}")
    print(f"  Official  (2026): {official_count}")
    print(f"  Fuzzy matched:    {matched}/{len(csv_lines)}")
    print(f"  Upgraded in-place: {upgraded}")
    print(f"  New official:      {matched - upgraded + len(csv_lines) - matched - len(unmatched_names)}")
    print(f"  Deduplicated:      {dedup_removed} potentials removed")
    if unmatched_names:
        print(f"  Unmatched CSV names ({len(unmatched_names)}):")
        for n in unmatched_names:
            print(f"    - {n}")
    print(f"{'='*60}")

    # 7. Write output
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(candidates, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {len(candidates)} candidates => {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
