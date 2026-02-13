export const scoreColor = (score: number) => {
    if (score >= 80) return "var(--accent-green)";
    if (score >= 60) return "var(--warning)";
    return "var(--danger)";
};

export const scoreBadge = (score: number) => {
    if (score >= 80) return "badge-safe";
    if (score >= 60) return "badge-moderate";
    return "badge-unsafe";
};

export const calculateCO2 = (weightKg: number) => (weightKg * 2.5).toFixed(1);

// ── Category base rules (matching rule_classifier.py) ──
const CATEGORY_RULES: Record<string, { score: number; suitable: string }> = {
    vegetable: { score: 95, suitable: "Pigs, Poultry, Cattle" },
    grain: { score: 92, suitable: "Poultry, Cattle" },
    bread: { score: 88, suitable: "Pigs, Poultry" },
    mixed: { score: 74, suitable: "Pigs" },
    dairy: { score: 67, suitable: "Pigs (limited)" },
    meat: { score: 40, suitable: "Not recommended" },
};
const DEFAULT_RULE = { score: 70, suitable: "Pigs" };

// Word-boundary keyword patterns with score adjustments
const POSITIVE_KW: [RegExp, number][] = [
    [/\bfresh\b/i, 5],
    [/\bclean\b/i, 3],
    [/\borganic\b/i, 5],
    [/\bprep scraps?\b/i, 2],
    [/\braw\b/i, 2],
    [/\buncooked\b/i, 2],
    [/\bmorning\b/i, 1],
    [/\bhygienic\b/i, 3],
    [/\brefrigerated\b/i, 4],
    [/\bcooled\b/i, 2],
    [/\bsorted\b/i, 2],
    [/\bsealed\b/i, 3],
];

const NEGATIVE_KW: [RegExp, number][] = [
    [/\bexpired?\b/i, -30],
    [/\bsmelly\b/i, -20],
    [/\bmold(?:y|ed)\b/i, -40],
    [/\bspoil(?:ed|t)?\b/i, -25],
    [/\bold\b/i, -10],
    [/\bleftover\b/i, -5],
    [/\bstale\b/i, -15],
    [/\bsour\b/i, -20],
    [/\brotten\b/i, -35],
    [/\bcontaminat\w*\b/i, -30],
    [/\bferment\w*\b/i, -15],
    [/\bunhygienic\b/i, -20],
];

/**
 * Get the base rule-based score from category alone (fixed formula).
 * This is instant and deterministic — no AI involved.
 */
export const getBaseScore = (category: string): { score: number; suitable: string } => {
    const cat = category.trim().toLowerCase();
    return CATEGORY_RULES[cat] || DEFAULT_RULE;
};

// ── Food type keyword adjustments (fixed formula) ──
const FOOD_TYPE_ADJUSTMENTS: [RegExp, number][] = [
    [/\b(rice|dal|lentil)\b/i, 3],
    [/\b(roti|chapati|naan|bread)\b/i, 2],
    [/\bvegetable\b/i, 4],
    [/\b(fruit|banana|apple|mango)\b/i, 3],
    [/\b(salad|greens|leafy)\b/i, 4],
    [/\b(curry|gravy|soup)\b/i, 1],
    [/\b(chicken|mutton|pork|beef|fish)\b/i, -8],
    [/\b(egg)\b/i, -3],
    [/\b(milk|curd|paneer|cheese)\b/i, -4],
    [/\b(oil|ghee|butter)\b/i, -2],
    [/\b(pizza|burger|fries)\b/i, -5],
    [/\b(cake|pastry|sweet)\b/i, -3],
    [/\b(biryani|pulao)\b/i, 0],
    [/\b(pickle|chutney)\b/i, -1],
];

/**
 * Get the score adjustment from food type keywords (fixed formula).
 */
export const getFoodTypeAdjustment = (foodType: string): number => {
    const ft = foodType.trim().toLowerCase();
    if (!ft) return 0;
    return FOOD_TYPE_ADJUSTMENTS.reduce((sum, [re, adj]) => sum + (re.test(ft) ? adj : 0), 0);
};

/**
 * Full rule-based classification (category + keyword analysis on description).
 * Used as a fallback when the Gemini API is unavailable.
 */
export const classifyWasteLogic = (
    category: string,
    description: string = "",
    weightKg?: number,
): { score: number; suitable: string; verdict: string; riskLevel: string } => {
    const base = getBaseScore(category);
    let score = base.score;

    // Keyword adjustments on description
    const desc = description.toLowerCase();
    const posAdj = POSITIVE_KW.reduce((sum, [re, adj]) => sum + (re.test(desc) ? adj : 0), 0);
    const negAdj = NEGATIVE_KW.reduce((sum, [re, adj]) => sum + (re.test(desc) ? adj : 0), 0);
    const weightPenalty = weightKg != null && weightKg > 50 ? -3 : 0;

    score = Math.max(0, Math.min(100, score + posAdj + negAdj + weightPenalty));

    // Determine risk level & verdict
    let riskLevel: string;
    let verdict: string;
    if (score >= 80) {
        riskLevel = "safe";
        verdict = "Safe — excellent for animal feed";
    } else if (score >= 60) {
        riskLevel = "moderate";
        verdict = "Moderate — needs quality check";
    } else {
        riskLevel = "unsafe";
        verdict = "Unsafe — not suitable for redistribution";
    }

    // Override suitability if score dropped
    let suitable = base.suitable;
    if (score < 60) suitable = "Not recommended";
    else if (score < 80) suitable = "Pigs (limited)";

    return { score, suitable, verdict, riskLevel };
};

/**
 * Apply a Gemini adjustment to a base score, returning final classification.
 */
export const applyAdjustment = (
    baseScore: number,
    baseSuitable: string,
    adjustment: number,
): { score: number; suitable: string; verdict: string; riskLevel: string } => {
    const score = Math.max(0, Math.min(100, baseScore + adjustment));

    let riskLevel: string;
    let verdict: string;
    if (score >= 80) {
        riskLevel = "safe";
        verdict = "Safe — excellent for animal feed";
    } else if (score >= 60) {
        riskLevel = "moderate";
        verdict = "Moderate — needs quality check";
    } else {
        riskLevel = "unsafe";
        verdict = "Unsafe — not suitable for redistribution";
    }

    let suitable = baseSuitable;
    if (score < 60) suitable = "Not recommended";
    else if (score < 80) suitable = "Pigs (limited)";

    return { score, suitable, verdict, riskLevel };
};
