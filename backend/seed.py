"""
Run to load/refresh Neetcode 250 into the database.
Idempotent: updates existing rows, inserts new ones, keyed on slug.

Usage:
    python seed.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, init_db
from app.models.problem import Problem
from app.models.vault_entry import VaultEntry

PATTERNS = [
    "Arrays & Hashing",
    "Two Pointers",
    "Sliding Window",
    "Stack",
    "Binary Search",
    "Linked List",
    "Trees",
    "Tries",
    "Heap / Priority Queue",
    "Backtracking",
    "Graphs",
    "Advanced Graphs",
    "1-D Dynamic Programming",
    "2-D Dynamic Programming",
    "Greedy",
    "Intervals",
    "Math & Geometry",
    "Bit Manipulation",
]


def seed():
    init_db()
    db = SessionLocal()

    data_path = os.path.join(os.path.dirname(__file__), "data", "neetcode250.json")
    with open(data_path) as f:
        data = json.load(f)

    inserted = 0
    updated = 0
    for p in data["problems"]:
        concepts_json = json.dumps(p.get("concepts", []))
        existing = db.query(Problem).filter(Problem.slug == p["slug"]).first()
        if existing:
            existing.neetcode_order = p["neetcode_order"]
            existing.title = p["title"]
            existing.difficulty = p["difficulty"]
            existing.pattern = p["pattern"]
            existing.leetcode_number = p.get("leetcode_number")
            existing.concepts = concepts_json
            updated += 1
        else:
            problem = Problem(
                neetcode_order=p["neetcode_order"],
                title=p["title"],
                slug=p["slug"],
                difficulty=p["difficulty"],
                pattern=p["pattern"],
                leetcode_number=p.get("leetcode_number"),
                concepts=concepts_json,
                status="todo",
            )
            db.add(problem)
            inserted += 1

    # Seed empty vault entries for each pattern
    vault_added = 0
    for pattern in PATTERNS:
        existing = db.query(VaultEntry).filter(VaultEntry.pattern == pattern).first()
        if not existing:
            db.add(VaultEntry(pattern=pattern, content=""))
            vault_added += 1

    db.commit()
    db.close()

    print(f"Problems: {inserted} inserted, {updated} updated.")
    print(f"Vault: {vault_added} new pattern entries added.")


if __name__ == "__main__":
    seed()
