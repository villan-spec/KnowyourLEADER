"""
migrate_official_candidates.py
-------------------------------
Parses 2026 Official Candidates txt, cross-verifies with
Final_Cleaned_Candidates_Data.xlsx (2021 data - by name + constituency),
then:
  1. Removes "potential" candidates whose constituency+party is now covered.
  2. Appends enriched "official" candidate records.
Writes updated data/candidates.json.
"""

import json
import re
import shutil
import unicodedata
from pathlib import Path

import pandas as pd
from thefuzz import fuzz

# ── paths ─────────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).resolve().parent.parent
TXT_FILE   = ROOT / "2026 Offical Candidates.txt"
EXCEL_FILE = ROOT / "Final_Cleaned_Candidates_Data.xlsx"
CANDIDATES = ROOT / "data" / "candidates.json"
BACKUP     = ROOT / "data" / "candidates.json.bak"

# ── party colours ─────────────────────────────────────────────────────────────
PARTY_COLORS = {
    "DMK":    "#E31E24",
    "AIADMK": "#006B3F",
    "NTK":    "#FF6600",
    "TVK":    "#7B2D8B",
    "PMK":    "#FF6600",
    "VCK":    "#0077BE",
    "MDMK":   "#CC0000",
    "TMC(M)": "#1565C0",
    "IJK":    "#999999",
}

# Map party name variants in TXT → Excel party code
PARTY_ALIAS = {
    "NTK":    "Naam Tamilar Katchi",
    "TVK":    "TVK",     
    "PMK":    "Pattali Makkal Katchi",
    "VCK":    "Viduthalai Chiruthaigal Katchi",
    "MDMK":   "Dravida Murpokku Makkal Katchi",
    "TMC(M)": "TMC",
    "IJK":    "IJK",
    "DMK":    "DMK",
    "AIADMK": "AIADMK",
    "BJP":    "BJP",
    "INC":    "INC",
}

FUZZY_THRESHOLD        = 75   # name fuzzy match floor
FUZZY_THRESHOLD_STRICT = 85   # used when no constituency filter


# ─────────────────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def clean_currency(val) -> int:
    """Parse 'Rs 5,10,000 ~ 5 Lacs+' -> 510000."""
    if pd.isna(val) or str(val).strip() in ("", "Nil", "0", "Rs 0"):
        return 0
    first = str(val).split("~")[0]
    digits = re.sub(r"[^\d]", "", first)
    return int(digits) if digits else 0


def clean_criminal(val) -> int:
    if pd.isna(val) or str(val).strip() in ("", "Nil", "0"):
        return 0
    digits = re.sub(r"[^\d]", "", str(val))
    return int(digits) if digits else 0


def norm_name(name: str) -> str:
    """Lowercase, collapse spaces/dots for fuzzy comparison."""
    name = name.lower().strip()
    name = re.sub(r"[.\-_,]", " ", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()


def norm_const(name: str) -> str:
    """
    Normalise constituency name for matching between TXT (title-case) and
    Excel (UPPERCASE, may include (SC) suffix).
    E.g. 'Chepauk-Thiruvallikeni' -> 'chepauik thiruvallikeni'
         'CHEPAUK-THIRUVALLIKENI' -> same
    """
    name = name.upper().strip()
    # Remove SC / ST reservation markers
    name = re.sub(r"\s*\(\s*SC\s*\)\s*|\s*\(\s*ST\s*\)\s*", "", name)
    name = re.sub(r"[^A-Z0-9\s]", " ", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 – Parse TXT
# ─────────────────────────────────────────────────────────────────────────────

HEADER_RE    = re.compile(
    r"^([\w\s()&/]+?)\s+Candidate List\s+Tamil Nadu Election 2026",
    re.IGNORECASE,
)
CANDIDATE_RE = re.compile(r"^(.+?)\s*-\s*(\d+)\s*-\s*(.+)$")


def parse_official_txt(path: Path) -> list:
    records = []
    current_party = None

    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line or line.startswith("---"):
                continue

            hm = HEADER_RE.match(line)
            if hm:
                current_party = hm.group(1).split(" ")[0].strip() # DMK, AIADMK, etc
                continue

            cm = CANDIDATE_RE.match(line)
            if cm and current_party:
                records.append(
                    {
                        "party":        current_party,
                        "const_no":     int(cm.group(2)),
                        "constituency": cm.group(3).strip(),
                        "name":         cm.group(1).strip(),
                    }
                )

    print(f"[parse]  Parsed {len(records)} official candidates from TXT")
    return records


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 – Load Excel
# ─────────────────────────────────────────────────────────────────────────────

def load_excel(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path)
    df.columns = [c.strip() for c in df.columns]
    print(f"[excel]  Loaded {len(df)} rows")

    df["_name_norm"]  = df["Candidate Name"].apply(norm_name)
    # Constituency in Excel is UPPERCASE; normalise uniformly
    df["_const_norm"] = df["Constituency"].apply(
        lambda x: norm_const(str(x)) if not pd.isna(x) else ""
    )
    df["_party_up"]   = df["Party"].apply(
        lambda x: str(x).strip().upper() if not pd.isna(x) else ""
    )
    df["_assets"]     = df["Total Assets"].apply(clean_currency)
    df["_liabs"]      = df["Liabilities"].apply(clean_currency)
    df["_criminal"]   = df["Criminal Case"].apply(clean_criminal)
    return df


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 – Cross-verify
# ─────────────────────────────────────────────────────────────────────────────

def find_match(record: dict, df: pd.DataFrame) -> dict | None:
    cand_name  = norm_name(record["name"])
    const_norm = norm_const(record["constituency"])
    party      = record["party"].upper()
    # Expand party abbreviations for Excel matching
    party_excel = PARTY_ALIAS.get(party, party).upper()

    # ---------- step A: exact name + constituency (any party) ----------
    mask_const = df["_const_norm"] == const_norm
    mask_name  = df["_name_norm"]  == cand_name
    exact = df[mask_const & mask_name]
    if not exact.empty:
        return exact.iloc[0].to_dict()

    # ---------- step B: fuzzy name within same constituency ----------
    const_rows = df[mask_const]
    if not const_rows.empty:
        scores = const_rows["_name_norm"].apply(
            lambda n: fuzz.token_sort_ratio(cand_name, n)
        )
        best_idx = scores.idxmax()
        if scores[best_idx] >= FUZZY_THRESHOLD:
            return const_rows.loc[best_idx].to_dict()

    # ---------- step C: same party + constituency (SC suffix variant) ----------
    # Try without the (SC)/(ST) stripped by norm_const  already, so
    # try a wider set: any row whose normalised const starts with our prefix
    prefix = const_norm[:6]  # first 6 chars usually unique enough
    if prefix:
        mask_prefix = df["_const_norm"].str.startswith(prefix)
        sub = df[mask_prefix]
        if not sub.empty:
            scores = sub["_name_norm"].apply(
                lambda n: fuzz.token_sort_ratio(cand_name, n)
            )
            best_idx = scores.idxmax()
            if scores[best_idx] >= FUZZY_THRESHOLD:
                return sub.loc[best_idx].to_dict()

    # ---------- step D: same party, loose name match ----------
    dmk_match = df[df["_party_up"] == party]
    if dmk_match.empty:
        dmk_match = df[df["_party_up"] == party_excel]
    if not dmk_match.empty:
        scores = dmk_match["_name_norm"].apply(
            lambda n: fuzz.token_sort_ratio(cand_name, n)
        )
        best_idx = scores.idxmax()
        if scores[best_idx] >= FUZZY_THRESHOLD_STRICT:
            return dmk_match.loc[best_idx].to_dict()

    return None


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 – Build candidate JSON object
# ─────────────────────────────────────────────────────────────────────────────

_ID_COUNTER = [1]


def make_candidate(record: dict, row: dict | None, dist_id: str) -> dict:
    party    = record["party"]
    cand_id  = f"cand-official-{_ID_COUNTER[0]:04d}"
    _ID_COUNTER[0] += 1

    assets    = row["_assets"]   if row else 0
    liabs     = row["_liabs"]    if row else 0
    criminal  = row["_criminal"] if row else 0
    education = str(row.get("Education", "")).strip() if row else "NIL"
    src_url   = str(row.get("Link", "")).strip()       if row else ""
    
    if src_url and not src_url.startswith("http"):
        src_url = "https://myneta.info/TamilNadu2021/" + src_url
    
    if education in ("", "nan", "Unknown"):
        education = "NIL"

    return {
        "id":                   cand_id,
        "name":                 record["name"],
        "nameTamil":            "",
        "party":                party,
        "partyColor":           PARTY_COLORS.get(party, "#999999"),
        "constituencyId":       slugify(record["constituency"]),
        "districtId":           dist_id,
        "constituencyNumber":   record["const_no"],
        "photo":                None,
        "source":               "official",
        "sourceUrl":            src_url,
        "declaredAssets":       assets,
        "liabilities":          liabs,
        "pendingCriminalCases": criminal,
        "localIssues":          [],
        "education":            education,
        "age":                  0,
        "lastUpdated":          "2026-03-30",
        "electionYear":         2026,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 – Update candidates.json
# ─────────────────────────────────────────────────────────────────────────────

def update_json(official_records: list, excel_df: pd.DataFrame, const_to_dist: dict):
    # Clear old database to avoid duplication, strictly following the new list
    new_officials = []
    unmatched_names = []
    matched = 0

    for record in official_records:
        row = find_match(record, excel_df)
        if row:
            matched += 1
        else:
            unmatched_names.append(f"{record['name']} | {record['party']} | {record['constituency']}")
        
        c_slug = slugify(record["constituency"])
        dist_id = const_to_dist.get(c_slug, "unknown")
        new_officials.append(make_candidate(record, row, dist_id))

    print(f"[match]  Matched {matched}/{len(official_records)} candidates to Excel")

    if unmatched_names:
        unmatched_path = ROOT / "data" / "unmatched_candidates.txt"
        with open(unmatched_path, "w", encoding="utf-8") as f:
            f.write("\n".join(unmatched_names))
        print(f"[match]  Unmatched list saved -> {unmatched_path.name}")

    final_db = new_officials
    print(f"[json]   Final size: {len(final_db)} candidates")

    with open(CANDIDATES, "w", encoding="utf-8") as f:
        json.dump(final_db, f, indent=2, ensure_ascii=False)

    print(f"[json]   Saved -> {CANDIDATES}")
    return matched, len(official_records) - matched, 0


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  2026 Official Candidate Migration")
    print("=" * 60)

    if CANDIDATES.exists():
        shutil.copy2(CANDIDATES, BACKUP)
        print(f"[backup] {BACKUP.name}")

    # Load districts to get mapping
    DISTRICTS_JSON = ROOT / "data" / "districts.json"
    const_to_dist = {}
    if DISTRICTS_JSON.exists():
        with open(DISTRICTS_JSON, encoding="utf-8") as f:
            dists = json.load(f)
            for d in dists:
                for c in d["constituencies"]:
                    const_to_dist[c["id"]] = d["id"]

    official = parse_official_txt(TXT_FILE)
    excel_df = load_excel(EXCEL_FILE)
    matched, unmatched, removed = update_json(official, excel_df, const_to_dist)

    print()
    print("=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Official candidates parsed   : {len(official)}")
    print(f"  Potential candidates removed : {removed}")
    print(f"  Matched to Excel (enriched)  : {matched}")
    print(f"  No Excel match (defaults=0)  : {unmatched}")
    print("  Migration complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
