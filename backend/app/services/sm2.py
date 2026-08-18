"""
SM-2 spaced repetition algorithm.

Given the user's perceived difficulty and prior interval, returns
the next review datetime and new interval in days.

perceived_difficulty: "easy" | "medium" | "hard"
interval_days:        previous interval (starts at 1)
attempt_number:       1-indexed attempt count for this problem
"""

from datetime import datetime, timedelta


_QUALITY = {
    "easy": 5,
    "medium": 3,
    "hard": 1,
}

_MIN_INTERVAL = 1
_MAX_INTERVAL = 365


def calculate_next_review(
    perceived_difficulty: str,
    interval_days: int,
    attempt_number: int,
) -> tuple[datetime, int]:
    q = _QUALITY.get(perceived_difficulty, 3)

    if q < 3:
        # Repeat soon — struggled
        new_interval = _MIN_INTERVAL
    elif attempt_number == 1:
        new_interval = 1
    elif attempt_number == 2:
        new_interval = 6
    else:
        easiness = 2.5 + 0.1 * (q - 3)  # simplified EF
        new_interval = round(interval_days * easiness)

    new_interval = max(_MIN_INTERVAL, min(_MAX_INTERVAL, new_interval))
    next_review_at = datetime.utcnow() + timedelta(days=new_interval)

    return next_review_at, new_interval
