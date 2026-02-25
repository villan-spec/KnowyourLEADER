"""Fix data consistency bugs in candidates.json."""
import json, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

candidates = json.load(open("data/candidates.json", encoding="utf-8"))
districts = json.load(open("data/districts.json", encoding="utf-8"))

# Build correct mapping
const_to_dist = {}
for d in districts:
    for c in d["constituencies"]:
        const_to_dist[c["id"]] = d["id"]

# ID remapping for old -> new constituency IDs
REMAP = {
    "ambur-tp": "ambur",
    "chengalpattu-town": "chengalpattu",
    "kallakurichi-town": "kallakurichi",
    "mayiladuthurai-town": "mayiladuthurai",
}

fixes = 0
for cand in candidates:
    # Fix renamed constituency IDs
    old_cid = cand["constituencyId"]
    if old_cid in REMAP:
        cand["constituencyId"] = REMAP[old_cid]
        print(f"  Fixed constituency: {cand['name']}: {old_cid} -> {REMAP[old_cid]}")
        fixes += 1

    # Fix district mismatches
    cid = cand["constituencyId"]
    if cid in const_to_dist and const_to_dist[cid] != cand["districtId"]:
        old_did = cand["districtId"]
        cand["districtId"] = const_to_dist[cid]
        print(f"  Fixed district: {cand['name']}: {old_did} -> {const_to_dist[cid]}")
        fixes += 1

print(f"\nTotal fixes applied: {fixes}")

with open("data/candidates.json", "w", encoding="utf-8") as f:
    json.dump(candidates, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("Saved candidates.json")
