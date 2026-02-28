import csv
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
MLAS_CSV = Path(__file__).parent.parent / "MLA Candidates (Education, Assets, Criminal Rec).csv"

def test():
    with open(MLAS_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for _ in range(3): next(reader, None)
        first_row = next(reader, None)
        print(f"Row Length: {len(first_row)}")
        print(f"Col 0: {first_row[0]}")
        print(f"Col 1: {first_row[1]}")
        print(f"Col 2: {first_row[2]}")
        
        # Test splitting
        c0 = first_row[0].split("|")
        print(f"Edu Name: {c0[0].strip()}, Edu Val: {c0[3].strip()}")
        c1 = first_row[1].split("|")
        print(f"Asset Name: {c1[0].strip()}, Asset Val: {c1[3].strip()}")
        c2 = first_row[2].split("|")
        print(f"Crime Name: {c2[0].strip()}, Crime Val: {c2[3].strip()}")

test()
