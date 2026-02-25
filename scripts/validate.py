"""Quick data validation for Know Your Leader."""
import json, sys, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

districts = json.load(open("data/districts.json", encoding="utf-8"))
candidates = json.load(open("data/candidates.json", encoding="utf-8"))

# Build lookups
valid_const = set()
valid_dist = set()
const_to_dist = {}
for d in districts:
    valid_dist.add(d["id"])
    for c in d["constituencies"]:
        valid_const.add(c["id"])
        const_to_dist[c["id"]] = d["id"]

errors = []

# 1. Check orphan constituencies
for cand in candidates:
    if cand["constituencyId"] not in valid_const:
        errors.append(f"BUG: {cand['name']} refs constituency '{cand['constituencyId']}' not in districts.json")

# 2. Check district mismatches
for cand in candidates:
    cid = cand["constituencyId"]
    if cid in const_to_dist and const_to_dist[cid] != cand["districtId"]:
        errors.append(f"BUG: {cand['name']} has districtId='{cand['districtId']}' but constituency '{cid}' belongs to '{const_to_dist[cid]}'")

# 3. Check duplicate candidate IDs
seen = set()
for cand in candidates:
    if cand["id"] in seen:
        errors.append(f"BUG: Duplicate candidate ID: {cand['id']}")
    seen.add(cand["id"])

# 4. Check required fields
for cand in candidates:
    for f in ["id", "name", "party", "constituencyId", "districtId", "source"]:
        if not cand.get(f):
            errors.append(f"BUG: {cand.get('name','?')} missing field '{f}'")

# Summary
print(f"Districts: {len(districts)}")
print(f"Constituencies: {len(valid_const)}")
print(f"Candidates: {len(candidates)}")
print(f"Errors found: {len(errors)}")
for e in errors:
    print(f"  {e}")

sys.exit(1 if errors else 0)
