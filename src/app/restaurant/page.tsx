"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Upload, CheckCircle2, AlertTriangle, XCircle, Package, Sparkles, ChevronDown, ImagePlus, X, Camera } from "lucide-react";
import { useState, useRef } from "react";
import { scoreColor, scoreBadge, getBaseScore, getFoodTypeAdjustment, applyAdjustment, classifyWasteLogic } from "@/lib/utils";

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
    vegetable: "/images/categories/vegetable.png",
    grain: "/images/categories/grain.png",
    bread: "/images/categories/bread.png",
    mixed: "/images/categories/mixed.png",
    dairy: "/images/categories/dairy.png",
    meat: "/images/categories/meat.png",
};

export default function RestaurantPage() {
    const { addWasteItem, wasteItems, userName } = useApp();

    const [step, setStep] = useState<"upload" | "classify" | "result">("upload");
    const [foodType, setFoodType] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("vegetable");
    const [weight, setWeight] = useState("");
    const [price, setPrice] = useState("");
    const [result, setResult] = useState<{ score: number; suitable: string; verdict: string } | null>(null);
    const [classifying, setClassifying] = useState(false);
    const [aiReasoning, setAiReasoning] = useState("");
    const [categoryWeight, setCategoryWeight] = useState(0);
    const [foodTypeWeight, setFoodTypeWeight] = useState(0);
    const [descriptionWeight, setDescriptionWeight] = useState(0);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [customImage, setCustomImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentImage = customImage || DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES.vegetable;

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be under 5MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setCustomImage(reader.result as string);
        reader.readAsDataURL(file);
    }

    const myItems = wasteItems.filter(i => i.restaurantName === userName);

    async function handleClassify() {
        setClassifying(true);
        setStep("classify");
        setAiReasoning("");

        // Step 1: Fixed rule-based base score from category
        const base = getBaseScore(category);
        setCategoryWeight(base.score);

        // Step 2: Fixed food type adjustment
        const ftAdj = getFoodTypeAdjustment(foodType);
        setFoodTypeWeight(ftAdj);

        try {
            // Step 3: Call Gemini to analyze description and refine score
            const res = await fetch("/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, baseScore: base.score + ftAdj }),
            });
            const data = await res.json();
            const adjustment: number = data.adjustment || 0;
            const reasoning: string = data.reasoning || "";

            setDescriptionWeight(adjustment);

            // Step 4: Combine all three
            const totalAdj = ftAdj + adjustment;
            const final = applyAdjustment(base.score, base.suitable, totalAdj);
            setResult(final);
            setAiReasoning(reasoning);
        } catch {
            // Fallback: use full rule-based classification if API fails
            const fallback = classifyWasteLogic(category, description, parseFloat(weight) || undefined);
            setResult(fallback);
            setDescriptionWeight(fallback.score - base.score - ftAdj);
            setAiReasoning("AI unavailable — used rule-based analysis");
        }

        setClassifying(false);
        setStep("result");
    }

    async function handleSubmit() {
        try {
            await addWasteItem({
                restaurantName: userName || "My Restaurant",
                foodType: foodType || "Food Waste",
                description: description,
                category: category as any,
                weightKg: parseFloat(weight) || 10,
                safetyScore: result?.score || 80,
                suitableFor: result?.suitable || "Pigs",
                price: parseFloat(price) || 100,
                distance: (Math.random() * 4 + 0.3).toFixed(1) + " km",
                imageUrl: currentImage,
            });
            setStep("upload");
            setFoodType("");
            setDescription("");
            setCategory("vegetable");
            setWeight("");
            setPrice("");
            setCustomImage(null);
            setResult(null);
        } catch (error) {
            console.error("Error submitting listing:", error);
            alert("Failed to submit listing. Please try again.");
        }
    }

    const ScoreIcon = ({ score }: { score: number }) =>
        score >= 80 ? <CheckCircle2 size={20} /> : score >= 60 ? <AlertTriangle size={20} /> : <XCircle size={20} />;

    return (
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
            <Navbar />
            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload size={22} color="var(--accent-green)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Upload Food Waste</h1>
                        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Get AI safety verification and list on marketplace</p>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
                    {/* Left: Upload Form */}
                    <div className="glass animate-fade-in-up" style={{ padding: 32 }}>
                        {step === "upload" && (
                            <>
                                {/* Category (1st) */}
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Category</label>
                                    <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="vegetable">Vegetable Scraps</option>
                                        <option value="grain">Grain / Rice / Dal</option>
                                        <option value="bread">Bread / Roti</option>
                                        <option value="mixed">Mixed Leftovers</option>
                                        <option value="dairy">Dairy Products</option>
                                        <option value="meat">Meat / Non-Veg</option>
                                    </select>
                                </div>

                                {/* Food Type (2nd) */}
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Food Type</label>
                                    <input className="input-field" placeholder="e.g. Vegetable Rice Mix" value={foodType} onChange={e => setFoodType(e.target.value)} />
                                </div>

                                {/* Waste Description (3rd) */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Waste Description</label>
                                    <textarea
                                        className="input-field"
                                        style={{ minHeight: 120, resize: "vertical", paddingTop: 12 }}
                                        placeholder="Describe the waste (e.g. Fresh vegetable scraps from morning prep, no meat contact, kept in clean bin)"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                    <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
                                        AI will analyze your description using rule-based classification.
                                    </p>
                                </div>

                                {/* Image Upload (Optional) */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                        <Camera size={14} /> Image <span style={{ fontWeight: 400, color: "var(--text-dim)" }}>(optional)</span>
                                    </label>

                                    <div style={{ display: "flex", gap: 16, alignItems: "start" }}>
                                        {/* Preview */}
                                        <div style={{
                                            width: 140, height: 105, borderRadius: 12, overflow: "hidden",
                                            border: customImage ? "2px solid var(--accent-green)" : "1px solid var(--border-color)",
                                            flexShrink: 0, position: "relative",
                                        }}>
                                            <img
                                                src={currentImage}
                                                alt="Waste preview"
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            {!customImage && (
                                                <div style={{
                                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                                    padding: "4px 8px", fontSize: 10, fontWeight: 600,
                                                    background: "rgba(0,0,0,0.6)", color: "var(--text-dim)",
                                                    textAlign: "center", backdropFilter: "blur(4px)",
                                                }}>Default</div>
                                            )}
                                            {customImage && (
                                                <button
                                                    onClick={() => { setCustomImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                    style={{
                                                        position: "absolute", top: 4, right: 4,
                                                        width: 22, height: 22, borderRadius: "50%",
                                                        background: "rgba(0,0,0,0.7)", border: "none",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        cursor: "pointer", color: "white",
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload button */}
                                        <div style={{ flex: 1 }}>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: "none" }}
                                                id="waste-image-upload"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    width: "100%", padding: "14px 16px", borderRadius: 12,
                                                    border: "1.5px dashed var(--border-color)",
                                                    background: "rgba(255,255,255,0.02)",
                                                    color: "var(--text-dim)", cursor: "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                    fontSize: 13, fontWeight: 600,
                                                    transition: "all 0.2s ease",
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-green)"; e.currentTarget.style.color = "var(--accent-green)"; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                                            >
                                                <ImagePlus size={18} />
                                                {customImage ? "Change Image" : "Upload Your Image"}
                                            </button>
                                            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
                                                Max 5MB • PNG, JPG, WebP
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight & Price (4th) */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Weight (kg)</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            min="0"
                                            placeholder="15"
                                            value={weight}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (!val || parseFloat(val) >= 0) setWeight(val);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Price (Rs)</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            min="0"
                                            placeholder="150"
                                            value={price}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (!val || parseFloat(val) >= 0) setPrice(val);
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleClassify}
                                    disabled={!foodType || !weight || !price || parseFloat(weight) <= 0 || parseFloat(price) < 0 || !description}
                                    style={{ marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (!foodType || !weight || !price || parseFloat(weight) <= 0 || parseFloat(price) < 0 || !description) ? 0.6 : 1 }}
                                >
                                    <Sparkles size={18} /> Check Safety with AI
                                </button>
                            </>
                        )}

                        {step === "classify" && classifying && (
                            <div style={{ textAlign: "center", padding: "60px 0" }}>
                                <div className="animate-pulse-green" style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                                    <Sparkles size={36} color="var(--accent-green)" />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Gemini AI Analyzing Waste...</h3>
                                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Applying rule-based scoring + AI description analysis</p>
                                <div style={{ marginTop: 24, height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--gradient-green)", borderRadius: 2, animation: "shimmer 1.5s infinite", width: "60%" }} />
                                </div>
                            </div>
                        )}

                        {step === "result" && result && (
                            <div className="animate-fade-in-up">
                                <div style={{ textAlign: "center", marginBottom: 32 }}>
                                    <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${scoreColor(result.score)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 30px ${scoreColor(result.score)}40` }}>
                                        <span className="animate-count" style={{ fontSize: 36, fontWeight: 900, color: scoreColor(result.score), fontFamily: "'Space Grotesk', sans-serif" }}>{result.score}</span>
                                    </div>
                                    <div className={`badge ${scoreBadge(result.score)}`} style={{ marginBottom: 8 }}>
                                        <ScoreIcon score={result.score} /> AI Safety Score
                                    </div>
                                    <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>{result.verdict}</p>
                                    {aiReasoning && (
                                        <p style={{ color: "var(--accent-cyan)", fontSize: 12, marginTop: 8, fontStyle: "italic", padding: "8px 16px", background: "rgba(6,182,212,0.08)", borderRadius: 8, display: "inline-block" }}>
                                            <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                                            {aiReasoning}
                                        </p>
                                    )}
                                </div>

                                {/* Score Breakdown (Collapsible Dropdown) */}
                                <div className="glass-sm" style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
                                    <button
                                        onClick={() => setShowBreakdown(!showBreakdown)}
                                        style={{
                                            width: "100%", padding: "16px 20px",
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            background: "transparent", border: "none", cursor: "pointer",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Score Breakdown</h4>
                                        <ChevronDown
                                            size={18}
                                            color="var(--text-dim)"
                                            style={{
                                                transition: "transform 0.3s ease",
                                                transform: showBreakdown ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                    </button>
                                    <div style={{
                                        maxHeight: showBreakdown ? 300 : 0,
                                        overflow: "hidden",
                                        transition: "max-height 0.4s ease",
                                        padding: showBreakdown ? "0 20px 20px" : "0 20px",
                                    }}>
                                        <div style={{ display: "grid", gap: 14 }}>
                                            {/* Category */}
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Category ({category})</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)", fontFamily: "'Space Grotesk', sans-serif" }}>{categoryWeight}</span>
                                                </div>
                                                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                                                    <div style={{ width: `${categoryWeight}%`, height: "100%", background: "var(--accent-green)", borderRadius: 10, transition: "width 0.8s ease" }} />
                                                </div>
                                            </div>
                                            {/* Food Type */}
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Food Type ({foodType || "—"})</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: foodTypeWeight >= 0 ? "var(--accent-cyan)" : "var(--warning)", fontFamily: "'Space Grotesk', sans-serif" }}>{foodTypeWeight >= 0 ? "+" : ""}{foodTypeWeight}</span>
                                                </div>
                                                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                                                    <div style={{ width: `${Math.min(100, Math.abs(foodTypeWeight) * 10)}%`, height: "100%", background: foodTypeWeight >= 0 ? "var(--accent-cyan)" : "var(--warning)", borderRadius: 10, transition: "width 0.8s ease" }} />
                                                </div>
                                            </div>
                                            {/* AI Description */}
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>AI Description Analysis</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: descriptionWeight >= 0 ? "var(--accent-emerald)" : "var(--danger)", fontFamily: "'Space Grotesk', sans-serif" }}>{descriptionWeight >= 0 ? "+" : ""}{descriptionWeight}</span>
                                                </div>
                                                <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                                                    <div style={{ width: `${Math.min(100, Math.abs(descriptionWeight) * 5)}%`, height: "100%", background: descriptionWeight >= 0 ? "var(--accent-emerald)" : "var(--danger)", borderRadius: 10, transition: "width 0.8s ease" }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-sm" style={{ padding: 20, marginBottom: 24 }}>
                                    <div style={{ display: "grid", gap: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Suitable Animals</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{result.suitable}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>CO2 Saved</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-green)" }}>{((parseFloat(weight) || 10) * 2.5).toFixed(1)} kg</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Carbon Credits</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-lime)" }}>+{((parseFloat(weight) || 10) * 0.5).toFixed(0)} credits</span>
                                        </div>
                                    </div>
                                </div>

                                {result.score >= 60 ? (
                                    <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        <CheckCircle2 size={18} /> List on Marketplace
                                    </button>
                                ) : (
                                    <div>
                                        <button className="btn-danger" disabled style={{ width: "100%", opacity: 0.7, cursor: "not-allowed" }}>
                                            <XCircle size={18} /> Unsafe - Cannot List
                                        </button>
                                        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)", marginTop: 12 }}>This waste is not suitable for animal feed redistribution.</p>
                                    </div>
                                )}
                                <button className="btn-secondary" onClick={() => setStep("upload")} style={{ width: "100%", marginTop: 12 }}>
                                    Upload Another
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: My Listings */}
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <Package size={18} color="var(--accent-green)" /> My Listings
                        </h3>
                        <div style={{ display: "grid", gap: 12 }}>
                            {myItems.length === 0 && (
                                <div className="glass-sm" style={{ padding: 32, textAlign: "center" }}>
                                    <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No listings yet. Upload your first waste!</p>
                                </div>
                            )}
                            {myItems.map((item, i) => (
                                <div key={item.id} className="glass-sm animate-slide-in" style={{ padding: 16, animationDelay: `${i * 0.1}s` }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600 }}>{item.foodType}</p>
                                            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.weightKg} kg - Rs {item.price}</p>
                                        </div>
                                        <div className={`badge ${item.status === "listed" ? "badge-neutral" : item.status === "sold" ? "badge-moderate" : "badge-safe"}`}>
                                            {item.status === "listed" ? "Listed" : item.status === "sold" ? "Sold" : "Picked Up"}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "var(--bg-secondary)" }}>
                                            <div style={{ height: "100%", borderRadius: 2, background: scoreColor(item.safetyScore), width: `${item.safetyScore}%` }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(item.safetyScore) }}>{item.safetyScore}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
