import json
from collections import Counter

with open('data/candidates.json', encoding='utf-8') as f:
    db = json.load(f)

official = [c for c in db if c.get('source') == 'official']
print(f'Total official: {len(official)}')
print()

# Break down by electionYear
years = Counter(c.get('electionYear', 'N/A') for c in official)
print('By election year:')
for yr, cnt in sorted(years.items(), key=lambda x: str(x[0])):
    print(f'  {yr}: {cnt}')
print()

# How many have 2026 year vs old
old_official = [c for c in official if c.get('electionYear') != 2026]
new_official = [c for c in official if c.get('electionYear') == 2026]
print(f'Pre-existing official (non-2026): {len(old_official)}')
print(f'New 2026 official: {len(new_official)}')
print()

# Sample old officials
print('Sample pre-existing official:')
for c in old_official[:5]:
    print(f"  {c['name']} | {c['party']} | {c['constituencyId']} | year={c.get('electionYear','?')}")
