"""
One-time script to add missing constituencies to districts.json.
These are real TN constituencies present in the 2021 XLSX but missing
from districts.json (which was manually curated with slightly different names).
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.abspath(__file__))
DJ_PATH = os.path.join(ROOT, "data", "districts.json")

with open(DJ_PATH, "r", encoding="utf-8") as f:
    districts = json.load(f)

existing_ids = set()
for dist in districts:
    for c in dist["constituencies"]:
        existing_ids.add(c["id"])

MISSING = [
    ("Cheyyar",             "cheyyar",            "tiruvannamalai"),
    ("Madhavaram",          "madhavaram",          "tiruvallur"),
    ("Katpadi",             "katpadi",             "vellore"),
    ("Manachanallur",       "manachanallur",       "tiruchirappalli"),
    ("Neyveli",             "neyveli",             "cuddalore"),
    ("Panruti",             "panruti",             "cuddalore"),
    ("Pappireddippatti",    "pappireddippatti",    "dharmapuri"),
    ("Thalli",              "thalli",              "krishnagiri"),
    ("Thirumangalam",       "thirumangalam",       "madurai"),
    ("Thiruthuraipoondi",   "thiruthuraipoondi",   "thiruvarur"),
    ("Thiruverumbur",       "thiruverumbur",       "tiruchirappalli"),
    ("Thiruvidaimarudur",   "thiruvidaimarudur",   "thanjavur"),
    ("Thiruvottiyur",       "thiruvottiyur",       "chennai"),
    ("Tittagudi",           "tittagudi",           "cuddalore"),
    ("Viralimalai",         "viralimalai",         "pudukkottai"),
    ("Kanniyakumari",       "kanniyakumari",       "kanyakumari"),
    ("Kumarapalayam",       "kumarapalayam",       "namakkal"),
]

added = 0
for name, cid, dist_id in MISSING:
    if cid in existing_ids:
        print(f"  SKIP {name} ({cid}) - already exists")
        continue
    target_dist = None
    for dist in districts:
        if dist["id"] == dist_id:
            target_dist = dist
            break
    if not target_dist:
        print(f"  ERROR: district '{dist_id}' not found for {name}")
        continue
    target_dist["constituencies"].append({
        "id": cid,
        "name": name,
        "nameTamil": "",
        "districtId": dist_id,
    })
    existing_ids.add(cid)
    added += 1
    print(f"  ADDED {name} ({cid}) to {target_dist['name']}")

with open(DJ_PATH, "w", encoding="utf-8") as f:
    json.dump(districts, f, indent=2, ensure_ascii=False)

total = sum(len(d["constituencies"]) for d in districts)
print(f"\nDone. Added {added} constituencies. Total now: {total}")
