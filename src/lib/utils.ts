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

export const classifyWasteLogic = (category: string) => {
    const rules: Record<string, { score: number; suitable: string; verdict: string }> = {
        vegetable: { score: 95, suitable: "Pigs, Poultry, Cattle", verdict: "Safe — excellent for animal feed" },
        grain: { score: 92, suitable: "Poultry, Cattle", verdict: "Safe — rich in carbohydrates" },
        bread: { score: 88, suitable: "Pigs, Poultry", verdict: "Safe — good energy source" },
        mixed: { score: 74, suitable: "Pigs", verdict: "Moderate — needs sorting" },
        dairy: { score: 65, suitable: "Pigs (limited)", verdict: "Caution — check freshness" },
        meat: { score: 40, suitable: "Not recommended", verdict: "Unsafe — risk of contamination" },
    };
    return rules[category] || { score: 70, suitable: "Pigs", verdict: "Moderate" };
};
