"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Upload, Camera, CheckCircle2, AlertTriangle, XCircle, Leaf, Package, Scale, Sparkles, ArrowRight, Clock, BadgeCheck } from "lucide-react";
import { useState, useRef } from "react";

export default function RestaurantPage() {
    const { addWasteItem, classifyWaste, wasteItems, userName } = useApp();

    const [step, setStep] = useState<"upload" | "classify" | "result">("upload");
    const [foodType, setFoodType] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("vegetable");
    const [weight, setWeight] = useState("");
    const [price, setPrice] = useState("");
    const [result, setResult] = useState<{ score: number; suitable: string; verdict: string } | null>(null);
    const [classifying, setClassifying] = useState(false);

    const myItems = wasteItems.filter(i => i.restaurantName === userName);


    function handleClassify() {
        setClassifying(true);
        setStep("classify");
        // Simulate AI delay
        setTimeout(() => {
            const r = classifyWaste(category);
            setResult(r);
            setClassifying(false);
            setStep("result");
        }, 2200);
    }

    function handleSubmit() {
        addWasteItem({
            restaurantName: userName || "My Restaurant",
            foodType: foodType || "Food Waste",
            category: category as any,
            weightKg: parseFloat(weight) || 10,
            safetyScore: result?.score || 80,
            suitableFor: result?.suitable || "Pigs",
            price: parseFloat(price) || 100,
            distance: (Math.random() * 4 + 0.3).toFixed(1) + " km",
            imageUrl: "",
        });
        // Reset
        setStep("upload");
        setFoodType("");
        setDescription("");
        setCategory("vegetable");
        setWeight("");
        setPrice("");
        setResult(null);
    }

    const scoreColor = (score: number) => score >= 80 ? "var(--accent-green)" : score >= 60 ? "var(--warning)" : "var(--danger)";
    const scoreBadge = (score: number) => score >= 80 ? "badge-safe" : score >= 60 ? "badge-moderate" : "badge-unsafe";
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
                    {/* ── Left: Upload Form ──────────────────────── */}
                    <div className="glass animate-fade-in-up" style={{ padding: 32 }}>
                        {step === "upload" && (
                            <>
                                {/* Description Input (Replaces Image) */}
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

                                {/* Fields */}
                                <div style={{ display: "grid", gap: 20 }}>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Food Type</label>
                                        <input className="input-field" placeholder="e.g. Vegetable Rice Mix" value={foodType} onChange={e => setFoodType(e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>Category</label>
                                        <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                                            <option value="vegetable">🥬 Vegetable Scraps</option>
                                            <option value="grain">🌾 Grain / Rice / Dal</option>
                                            <option value="bread">🍞 Bread / Roti</option>
                                            <option value="mixed">🍱 Mixed Leftovers</option>
                                            <option value="dairy">🥛 Dairy Products</option>
                                            <option value="meat">🥩 Meat / Non-Veg</option>
                                        </select>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleClassify}
                                    disabled={!foodType || !weight || !price || parseFloat(weight) <= 0}
                                    style={{ marginTop: 28, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (!foodType || !weight || !price || parseFloat(weight) <= 0) ? 0.6 : 1 }}
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
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>AI Analyzing Waste...</h3>
                                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>Running safety classification model</p>
                                <div style={{ marginTop: 24, height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--gradient-green)", borderRadius: 2, animation: "shimmer 1.5s infinite", width: "60%" }} />
                                </div>
                            </div>
                        )}

                        {step === "result" && result && (
                            <div className="animate-fade-in-up">
                                {/* Score display */}
                                <div style={{ textAlign: "center", marginBottom: 32 }}>
                                    <div style={{ width: 100, height: 100, borderRadius: "50%", border: `4px solid ${scoreColor(result.score)}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 30px ${scoreColor(result.score)}40` }}>
                                        <span className="animate-count" style={{ fontSize: 36, fontWeight: 900, color: scoreColor(result.score), fontFamily: "'Space Grotesk', sans-serif" }}>{result.score}</span>
                                    </div>
                                    <div className={`badge ${scoreBadge(result.score)}`} style={{ marginBottom: 8 }}>
                                        <ScoreIcon score={result.score} /> AI Safety Score
                                    </div>
                                    <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>{result.verdict}</p>
                                </div>

                                {/* Details */}
                                <div className="glass-sm" style={{ padding: 20, marginBottom: 24 }}>
                                    <div style={{ display: "grid", gap: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Suitable Animals</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{result.suitable}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>CO₂ Saved</span>
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
                                            <XCircle size={18} /> Unsafe — Cannot List
                                        </button>
                                        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)", marginTop: 12 }}>This waste is not suitable for animal feed redistribution.</p>
                                    </div>
                                )}
                                <button className="btn-secondary" onClick={() => setStep("upload")} style={{ width: "100%", marginTop: 12 }}>
                                    ← Upload Another
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Right: My Listings ─────────────────────── */}
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
                                            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.weightKg} kg • Rs {item.price}</p>
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
