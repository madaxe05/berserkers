import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a food safety analyst for animal feed. Given a waste description and a base safety score (0-100), analyze the description and return a JSON adjustment.

Consider:
- Freshness indicators (fresh, refrigerated, sealed → positive)
- Spoilage indicators (moldy, rotten, expired, smelly → negative)
- Contamination risks (chemicals, plastic, mixed with non-food → very negative)
- Storage conditions mentioned
- Hygiene indicators

Return ONLY valid JSON, no markdown, no explanation:
{"adjustment": <number from -30 to +10>, "reasoning": "<one sentence>"}`;

export async function POST(req: NextRequest) {
    try {
        const { description, baseScore } = await req.json();

        if (!description || typeof description !== "string") {
            return NextResponse.json({ adjustment: 0, reasoning: "No description provided" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ adjustment: 0, reasoning: "API key not configured" }, { status: 200 });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Base safety score: ${baseScore}/100\nWaste description: "${description}"\n\nAnalyze and return the JSON adjustment.`
                    }]
                }],
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 150,
                    responseMimeType: "application/json",
                }
            }),
        });

        if (!response.ok) {
            console.error("Gemini API error:", response.status, await response.text());
            return NextResponse.json({ adjustment: 0, reasoning: "AI service unavailable" });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        const parsed = JSON.parse(text);
        const adjustment = Math.max(-30, Math.min(10, Number(parsed.adjustment) || 0));
        const reasoning = String(parsed.reasoning || "AI analysis complete");

        return NextResponse.json({ adjustment, reasoning });

    } catch (error) {
        console.error("Classify API error:", error);
        return NextResponse.json({ adjustment: 0, reasoning: "Analysis failed, using rule-based score" });
    }
}
