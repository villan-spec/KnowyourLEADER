import json

with open('data/candidates.json', encoding='utf-8') as f:
    db = json.load(f)

official = [c for c in db if c.get('source') == 'official']
print(f"Total official: {len(official)}")
print()

targets = ['MK. Stalin', 'Udhayanidhi Stalin', 'Duraimurugan', 'Anbil Mahesh', 'K. Palaniswami', 'Senthil Balaji']
for t in targets:
    found = [c for c in official if t.lower() in c['name'].lower()]
    for c in found:
        assets_cr = c['declaredAssets'] / 10000000
        print(f"Name:       {c['name']}")
        print(f"  Party:     {c['party']} | Const: {c['constituencyId']}")
        print(f"  Education: {c['education']}")
        print(f"  Assets:    Rs {c['declaredAssets']:,} (~{assets_cr:.1f} Cr)")
        print(f"  Criminal:  {c['pendingCriminalCases']} case(s)")
        print()

# Spot-check TVK (no excel match expected) 
tvk_sample = [c for c in official if c['party'] == 'TVK'][:3]
print("=== TVK Sample (no Excel match expected) ===")
for c in tvk_sample:
    print(f"  {c['name']} | {c['constituencyId']} | assets={c['declaredAssets']} | education={c['education']}")

print()
print("=== Source distribution ===")
from collections import Counter
sources = Counter(c.get('source','?') for c in db)
for src, count in sources.most_common():
    print(f"  {src}: {count}")
