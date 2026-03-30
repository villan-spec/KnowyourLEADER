import json
from datetime import datetime

def education_score(edu_string):
    if not edu_string: return 0
    
    edu = str(edu_string).lower()
    scores = {
        'phd': 7, 'doctorate': 7,
        'm.tech': 6, 'mba': 6, 'm.sc': 6, 'ma': 6, 'post graduate': 6, 'postgraduate': 6,
        'b.tech': 5, 'be': 5, 'mbbs': 5, 'b.sc': 5, 'ba': 5, 'graduate': 5, 'degree': 5,
        '12th': 3, 'higher secondary': 3,
        '10th': 2, 'high school': 2,
        '8th': 1, '5th': 1, 'primary': 1,
    }
    for key, score in scores.items():
        if key in edu:
            return score
    return 0

def find_most_educated(candidates):
    phd_candidates = [c for c in candidates if 'phd' in str(c.get('education', '')).lower()]
    if phd_candidates:
        return max(phd_candidates, key=lambda c: str(c.get('education', '')).lower().count('phd'))
    return max(candidates, key=lambda c: education_score(c.get('education', '')))

def compute_party_breakdown(candidates):
    parties = ['DMK', 'AIADMK', 'BJP', 'INC', 'PMK', 'DMDK', 'NTK', 'TVK']
    stats = {}
    
    for party in parties + ['Others']:
        if party == 'Others':
            pc = [c for c in candidates if c.get('party') not in parties]
        else:
            pc = [c for c in candidates if c.get('party') == party]
            
        if not pc: continue
        
        clean = len([c for c in pc if c.get('pendingCriminalCases', 0) == 0])
        stats[party] = {
            'total': len(pc),
            'avg_cases': round(sum(c.get('pendingCriminalCases', 0) for c in pc) / len(pc), 2),
            'clean_percent': round((clean / len(pc)) * 100, 1),
            'avg_assets': sum(c.get('declaredAssets', 0) for c in pc) // len(pc)
        }
    return stats

def compute_education_stats(candidates):
    breakdown = {
        'phd': 0, 'graduate': 0, 'high_school': 0, 'middle': 0, 'primary': 0, 'na': 0
    }
    for c in candidates:
        edu = str(c.get('education', '')).lower()
        score = education_score(edu)
        if score == 7: breakdown['phd'] += 1
        elif score >= 5: breakdown['graduate'] += 1
        elif score >= 2: breakdown['high_school'] += 1
        elif score == 1: breakdown['primary'] += 1
        else: breakdown['na'] += 1
    return breakdown

def compute_landing_stats():
    with open('data/candidates.json', 'r', encoding='utf-8') as f:
        candidates = json.load(f)
        
    candidates = [c for c in candidates if c.get('source') == 'official']
    
    richest = max(candidates, key=lambda c: c.get('declaredAssets', 0))
    
    # poorest but > 0
    poorest_candidates = [c for c in candidates if c.get('declaredAssets', 0) > 0]
    poorest = min(poorest_candidates, key=lambda c: c.get('declaredAssets', 0)) if poorest_candidates else candidates[0]
    
    most_criminal = max(candidates, key=lambda c: c.get('pendingCriminalCases', 0))
    most_educated = find_most_educated(candidates)
    
    stats = {
        'total_candidates': len(candidates),
        'total_wealth': sum(c.get('declaredAssets', 0) for c in candidates),
        'clean_record_count': len([c for c in candidates if c.get('pendingCriminalCases', 0) == 0]),
        'heavy_criminal_count': len([c for c in candidates if c.get('pendingCriminalCases', 0) >= 10]),
        
        'record_holders': {
            'richest': richest,
            'poorest': poorest,
            'most_criminal': most_criminal,
            'most_educated': most_educated,
        },
        
        'party_stats': compute_party_breakdown(candidates),
        'education_breakdown': compute_education_stats(candidates),
        
        'last_updated': datetime.now().isoformat()
    }
    
    with open('data/landing-cache.json', 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    print(f"[Done] Landing stats computed: {len(candidates)} official candidates")

if __name__ == '__main__':
    compute_landing_stats()
