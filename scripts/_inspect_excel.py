import pandas as pd
df = pd.read_excel('Final_Cleaned_Candidates_Data.xlsx')

print('Unique parties in Excel:')
print(sorted(df['Party'].dropna().unique().tolist()))
print()

print('Sample DMK rows:')
dmk = df[df['Party'] == 'DMK'].head(5)
print(dmk[['Candidate Name','Constituency','Party','Education','Total Assets','Criminal Case']].to_string())
print()

search_terms = ['Stalin', 'Udhayanidhi', 'Senthil Balaji', 'Duraimurugan', 'Anbil']
for term in search_terms:
    found = df[df['Candidate Name'].str.contains(term, case=False, na=False)]
    if not found.empty:
        row = found.iloc[0]
        print(f'{term}: {row["Candidate Name"]} | {row["Party"]} | {row["Constituency"]}')
    else:
        print(f'{term}: NOT FOUND in Excel')

print()
print('Total rows:', len(df))
print('Columns:', df.columns.tolist())
