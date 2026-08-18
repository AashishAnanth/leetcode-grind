"""
Claude API wrapper for the whiteboard feature.
"""
import json

import anthropic

from app.core.config import settings

MODEL = "claude-haiku-4-5-20251001"
MAX_HISTORY = 10  # messages kept in context (pairs of user+assistant)


def _build_system_prompt(
    problem,
    latest_code: str | None,
    mode: str,
    vault_content: str | None = None,
) -> str:
    concepts = []
    if problem.concepts:
        try:
            concepts = json.loads(problem.concepts)
        except Exception:
            pass

    lc_ref = f"LeetCode #{problem.leetcode_number}" if problem.leetcode_number else ""

    code_block = ""
    if latest_code:
        code_block = f"\nThe student's latest code attempt:\n```\n{latest_code}\n```\n"

    vault_block = ""
    if vault_content and vault_content.strip():
        vault_block = f"\nThe student's personal notes on the {problem.pattern} pattern:\n{vault_content}\n"

    if mode == "hint":
        mode_instruction = (
            "You are in HINT mode. Guide the student toward the solution using Socratic questioning. "
            "Do NOT reveal the complete solution or write working code for them. "
            "Ask questions that expose the gap in their thinking. "
            "If they have code, point out what's wrong conceptually without rewriting it. "
            "Keep responses concise — one nudge at a time."
        )
    else:
        mode_instruction = (
            "You are in EXPLAIN mode. Give a thorough, direct explanation. "
            "If the student has code, identify the specific gaps or bugs and explain why they're wrong. "
            "Walk through the optimal approach step by step. "
            "Include time and space complexity. Write clean example code when helpful."
        )

    return f"""You are a coaching assistant helping a student prepare for SWE internship interviews by grinding the Neetcode 250.

Problem: {problem.title} {lc_ref}
Pattern: {problem.pattern}
Difficulty: {problem.difficulty.capitalize()}
Key concepts: {", ".join(concepts) if concepts else "n/a"}
{vault_block}{code_block}
{mode_instruction}

Keep a coaching tone — direct, encouraging, and focused on building the student's intuition, not just giving answers."""


def chat(
    problem,
    history: list[dict],  # [{"role": "user"|"assistant", "content": str}]
    user_message: str,
    mode: str,
    latest_code: str | None,
    vault_content: str | None = None,
) -> str:
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    # Trim history to last MAX_HISTORY messages (must stay as alternating user/assistant)
    trimmed = history[-(MAX_HISTORY * 2):]

    messages = [*trimmed, {"role": "user", "content": user_message}]

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=_build_system_prompt(problem, latest_code, mode, vault_content),
        messages=messages,
    )

    return response.content[0].text


def draft_vault_entry(pattern: str, solved_summaries: list[dict]) -> str:
    """
    Generate a starter vault entry for a pattern based on the user's solve history.
    solved_summaries: list of {title, difficulty, perceived_difficulty, notes}
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    solved_block = ""
    if solved_summaries:
        lines = [
            f"- {s['title']} ({s['difficulty']}, felt {s.get('perceived_difficulty') or 'unrated'})"
            + (f": {s['notes']}" if s.get("notes") else "")
            for s in solved_summaries
        ]
        solved_block = "\nProblems the student has solved using this pattern:\n" + "\n".join(lines)

    system = """You are helping a student build their personal algorithm pattern notes.
Write a concise, practical markdown reference entry for the given pattern.

Structure it as:
# {Pattern Name}

## Core idea
One or two sentences on when and why you reach for this pattern.

## Template / skeleton
A short pseudocode or Python snippet showing the canonical shape of the solution.

## Key decisions
Bullet list of the 2-4 things you need to decide when applying this pattern (e.g. window expansion condition, when to shrink, etc.)

## Gotchas
2-3 common mistakes or edge cases.

## Complexity
Typical time and space complexity.

Keep it tight — this is a cheat-sheet, not a textbook. Write as if explaining to yourself."""

    user_msg = f"Pattern: {pattern}"
    if solved_block:
        user_msg += f"\n{solved_block}"
    user_msg += "\n\nDraft the vault entry."

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": user_msg}],
    )

    return response.content[0].text


def analyze(problem, code: str, vault_content: str | None = None) -> str:
    """
    Perform a one-shot code gap analysis on the student's latest submission.
    Returns a structured critique: pattern identification, approach quality,
    specific line-level issues, and connections to the pattern vault.
    """
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    concepts = []
    if problem.concepts:
        try:
            concepts = json.loads(problem.concepts)
        except Exception:
            pass

    lc_ref = f"LeetCode #{problem.leetcode_number}" if problem.leetcode_number else ""

    vault_block = ""
    if vault_content and vault_content.strip():
        vault_block = f"\nThe student's personal notes on the {problem.pattern} pattern:\n{vault_content}\n"

    system = f"""You are an expert code reviewer analyzing a student's LeetCode solution.

Problem: {problem.title} {lc_ref}
Pattern: {problem.pattern}
Difficulty: {problem.difficulty.capitalize()}
Key concepts: {", ".join(concepts) if concepts else "n/a"}
{vault_block}
Your job is to give a precise, actionable code gap analysis. Structure your response as:

1. **Pattern recognition** — Did they use the right pattern? If not, what did they use instead?
2. **Approach quality** — Is the approach optimal? State time/space complexity of their solution vs. optimal.
3. **Specific issues** — Quote specific lines or logic. Explain *why* each is wrong or suboptimal (e.g. "recomputing max on every iteration — this is what the sliding window eliminates").
4. **Vault connection** — Based on the pattern notes above, identify which concept gaps are exposed. If vault notes are thin on a relevant topic, call that out.

Be direct and specific. Do not rewrite their code unless a short snippet is needed to illustrate a point."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": f"Here is my solution:\n\n```\n{code}\n```\n\nPlease analyze it."}],
    )

    return response.content[0].text
