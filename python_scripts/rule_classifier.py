"""
Rule-Based Food Waste Classifier for Anna-Chain
Classifies food waste items and calculates safety scores
based on category, food type keywords, and description analysis.
"""

import argparse
import json
import re
from dataclasses import dataclass, asdict
from typing import Optional


# ── Data Classes ────────────────────────────────────────────────

@dataclass
class ClassificationResult:
    category: str
    food_type: str
    description: str
    score: int
    suitable: str
    verdict: str
    risk_level: str  # "safe", "moderate", "unsafe"


# ── Rule Definitions ────────────────────────────────────────────

# Base scores per waste category
@dataclass
class CategoryRule:
    score: int
    suitable: str

CATEGORY_RULES: dict[str, CategoryRule] = {
    "vegetable": CategoryRule(score=95, suitable="Pigs, Poultry, Cattle"),
    "grain":     CategoryRule(score=92, suitable="Poultry, Cattle"),
    "bread":     CategoryRule(score=88, suitable="Pigs, Poultry"),
    "mixed":     CategoryRule(score=74, suitable="Pigs"),
    "dairy":     CategoryRule(score=67, suitable="Pigs (limited)"),
    "meat":      CategoryRule(score=40, suitable="Not recommended"),
}

DEFAULT_RULE = CategoryRule(score=70, suitable="Pigs")

# Keyword modifiers — use word-boundary regex patterns to avoid
# false positives (e.g. "old" matching "cold" or "golden").
POSITIVE_KEYWORDS: list[tuple[str, int]] = [
    (r"\bfresh\b",        5),
    (r"\bclean\b",        3),
    (r"\borganic\b",      5),
    (r"\bprep scraps?\b", 2),
    (r"\braw\b",          2),
    (r"\buncooked\b",     2),
    (r"\bmorning\b",      1),
    (r"\bhygienic\b",     3),
    (r"\brefrigerated\b", 4),
    (r"\bcooled\b",       2),
    (r"\bsorted\b",       2),
    (r"\bsealed\b",       3),
]

NEGATIVE_KEYWORDS: list[tuple[str, int]] = [
    (r"\bexpired?\b",     -30),
    (r"\bsmelly\b",       -20),
    (r"\bmold(?:y|ed)\b", -40),
    (r"\bspoil(?:ed|t)?\b", -25),
    (r"\bold\b",          -10),
    (r"\bleftover\b",      -5),
    (r"\bstale\b",        -15),
    (r"\bsour\b",         -20),
    (r"\brotten\b",       -35),
    (r"\bcontaminat\w*\b", -30),
    (r"\bferment\w*\b",   -15),
    (r"\bunhygienic\b",   -20),
]

# Suitability downgrade table — when score drops, narrow the audience
SUITABILITY_OVERRIDES: list[tuple[int, Optional[str]]] = [
    (80, None),           # keep original suitability
    (60, "Pigs (limited)"),
    (0,  "Not recommended"),
]


# ── Pre-compile regex patterns once ─────────────────────────────

_POSITIVE_RE = [(re.compile(pat, re.IGNORECASE), adj) for pat, adj in POSITIVE_KEYWORDS]
_NEGATIVE_RE = [(re.compile(pat, re.IGNORECASE), adj) for pat, adj in NEGATIVE_KEYWORDS]


# ── Classification Logic ────────────────────────────────────────

def classify_waste(
    category: str,
    food_type: str,
    description: str,
    weight_kg: Optional[float] = None,
) -> ClassificationResult:
    """
    Classify a food waste item and return a safety score.

    Args:
        category:    One of vegetable, grain, bread, mixed, dairy, meat.
        food_type:   Specific food name (e.g. "Carrot", "Rice").
        description: Free-text description of the waste condition.
        weight_kg:   Optional weight — large batches get a small penalty
                     because inconsistent quality is more likely.

    Returns:
        ClassificationResult with score clamped to [0, 100].
    """
    cat = category.strip().lower()
    rule = CATEGORY_RULES.get(cat, DEFAULT_RULE)
    score: int = rule.score
    base_suitable: str = rule.suitable

    # ── Keyword adjustments ──
    desc = description.lower()
    pos_adj: int = sum(adj for pattern, adj in _POSITIVE_RE if pattern.search(desc))
    neg_adj: int = sum(adj for pattern, adj in _NEGATIVE_RE if pattern.search(desc))
    weight_penalty: int = -3 if (weight_kg is not None and weight_kg > 50) else 0

    # ── Apply adjustments & clamp ──
    score = max(0, min(100, score + pos_adj + neg_adj + weight_penalty))

    # ── Determine risk level & verdict ──
    if score >= 80:
        risk_level = "safe"
        verdict = "Safe — excellent for animal feed"
    elif score >= 60:
        risk_level = "moderate"
        verdict = "Moderate — needs quality check"
    else:
        risk_level = "unsafe"
        verdict = "Unsafe — not suitable for redistribution"

    # ── Override suitability if score dropped significantly ──
    suitable = base_suitable
    for threshold, override in SUITABILITY_OVERRIDES:
        if score >= threshold:
            suitable = override if override else base_suitable
            break

    return ClassificationResult(
        category=cat,
        food_type=food_type,
        description=description,
        score=score,
        suitable=suitable,
        verdict=verdict,
        risk_level=risk_level,
    )


# ── CLI ──────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Rule-based food waste classifier for Anna-Chain"
    )
    parser.add_argument("--category", required=True, help="Waste category")
    parser.add_argument("--food", required=True, help="Specific food type")
    parser.add_argument("--description", required=True, help="Waste description")
    parser.add_argument("--weight", type=float, default=None, help="Weight in kg")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    result: ClassificationResult = classify_waste(args.category, args.food, args.description, args.weight)

    if args.json:
        print(json.dumps(asdict(result), indent=2))  # type: ignore[arg-type]
    else:
        print("=" * 40)
        print("  Classification Result")
        print("=" * 40)
        print(f"  Category:    {result.category}")
        print(f"  Food Type:   {result.food_type}")
        print(f"  Score:       {result.score}/100")
        print(f"  Risk Level:  {result.risk_level.upper()}")
        print(f"  Suitable:    {result.suitable}")
        print(f"  Verdict:     {result.verdict}")
        print("=" * 40)


if __name__ == "__main__":
    main()
