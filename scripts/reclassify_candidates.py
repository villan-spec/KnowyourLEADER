"""One-time reclassification: change all 'official' candidates to 'potential'.

Since no 2026 ECI official list has been released yet, all candidates sourced
from MyNeta 2021 data should be marked as 'potential' candidates, not 'official'.
Also adds assetsSourceUrl and casesSourceUrl fields where missing.
"""
import json, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

candidates = json.load(open("data/candidates.json", encoding="utf-8"))

reclassified = 0
urls_added = 0

for cand in candidates:
    # Reclassify official -> potential (since 2026 ECI data isn't live)
    if cand.get("source") == "official":
        cand["source"] = "potential"
        reclassified += 1

    # Add per-field source URLs if missing but sourceUrl exists
    if cand.get("sourceUrl") and not cand.get("assetsSourceUrl"):
        cand["assetsSourceUrl"] = cand["sourceUrl"]
        urls_added += 1
    if cand.get("sourceUrl") and not cand.get("casesSourceUrl"):
        cand["casesSourceUrl"] = cand["sourceUrl"]

print(f"Reclassified {reclassified} candidates: official -> potential")
print(f"Added per-field source URLs for {urls_added} candidates")

with open("data/candidates.json", "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("Saved candidates.json")
