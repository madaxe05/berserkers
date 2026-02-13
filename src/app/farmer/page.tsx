"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import {
    ShoppingCart, MapPin, Scale, ShieldCheck, CheckCircle2, Camera, Truck,
    Package, Search, Leaf, Star, Clock, Salad, Wheat, CakeSlice, UtensilsCrossed,
    X, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { scoreColor, scoreBadge } from "@/lib/utils";
import { WasteItem } from "@/lib/types";

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
    vegetable: "/images/categories/vegetable.png",
    grain: "/images/categories/grain.png",
    bread: "/images/categories/bread.png",
    mixed: "/images/categories/mixed.png",
    dairy: "/images/categories/dairy.png",
    meat: "/images/categories/meat.png",
};

export default function FarmerPage() {
    const { wasteItems, buyItem, confirmPickup, userName } = useApp();
    const [tab, setTab] = useState<"browse" | "purchases">("browse");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [confirmItem, setConfirmItem] = useState<WasteItem | null>(null);

    const listedItems = wasteItems.filter(i => i.status === "listed" && i.safetyScore >= 60);
    const myPurchases = wasteItems.filter(i => (i.status === "sold" || i.status === "picked_up") && i.buyerName === userName);

    const filtered = listedItems.filter(i => {
        if (filter !== "all" && i.category !== filter) return false;
        if (search && !i.foodType.toLowerCase().includes(search.toLowerCase()) && !i.restaurantName.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    async function handleBuy(id: string) {
        setProcessingId(id);
        try { await buyItem(id); }
        catch (error) { console.error("Error buying item:", error); }
        finally { setProcessingId(null); setConfirmItem(null); }
    }

    async function handlePickup(id: string) {
        setProcessingId(id);
        try { await confirmPickup(id); }
        catch (error) { console.error("Error confirming pickup:", error); }
        finally { setProcessingId(null); }
    }

    const CATEGORY_FILTERS: { key: string; label: string; icon: React.ReactNode }[] = [
        { key: "all", label: "All", icon: null },
        { key: "vegetable", label: "Veg", icon: <Salad size={14} /> },
        { key: "grain", label: "Grain", icon: <Wheat size={14} /> },
        { key: "bread", label: "Bread", icon: <CakeSlice size={14} /> },
        { key: "mixed", label: "Mixed", icon: <UtensilsCrossed size={14} /> },
    ];

    return (
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
            <Navbar />
            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 60 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingCart size={22} color="var(--accent-emerald)" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Feed Marketplace</h1>
                            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Browse affordable animal feed from nearby restaurants</p>
                        </div>
                    </div>
                    <div className="badge badge-safe" style={{ fontSize: 13 }}>
                        <Leaf size={14} /> {listedItems.length} Available
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-secondary)", borderRadius: 12, padding: 4 }}>
                    <button
                        onClick={() => setTab("browse")}
                        style={{
                            flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                            border: "none", cursor: "pointer", transition: "all 0.2s ease",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            background: tab === "browse" ? "rgba(34,197,94,0.15)" : "transparent",
                            color: tab === "browse" ? "var(--accent-green)" : "var(--text-dim)",
                        }}
                    >
                        <Package size={16} /> Browse Feed
                    </button>
                    <button
                        onClick={() => setTab("purchases")}
                        style={{
                            flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                            border: "none", cursor: "pointer", transition: "all 0.2s ease",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            background: tab === "purchases" ? "rgba(34,197,94,0.15)" : "transparent",
                            color: tab === "purchases" ? "var(--accent-green)" : "var(--text-dim)",
                        }}
                    >
                        <Truck size={16} /> My Purchases
                        {myPurchases.length > 0 && (
                            <span style={{ background: "var(--accent-green)", color: "#0a0f0d", fontSize: 11, fontWeight: 800, borderRadius: 50, minWidth: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>
                                {myPurchases.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Browse Tab */}
                {tab === "browse" && (
                    <>
                        {/* Filters */}
                        <div className="glass-sm" style={{ padding: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                                <Search size={16} color="var(--text-dim)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                <input className="input-field" placeholder="Search by food or restaurant..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {CATEGORY_FILTERS.map(f => (
                                    <button key={f.key} onClick={() => setFilter(f.key)}
                                        style={{
                                            padding: "8px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            border: filter === f.key ? "1.5px solid var(--accent-green)" : "1.5px solid var(--border-color)",
                                            background: filter === f.key ? "rgba(34,197,94,0.15)" : "transparent",
                                            color: filter === f.key ? "var(--accent-green)" : "var(--text-dim)",
                                            transition: "all 0.2s ease",
                                            display: "flex", alignItems: "center", gap: 6,
                                        }}
                                    >
                                        {f.icon} {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Marketplace grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                            {filtered.map((item, i) => (
                                <div key={item.id} className="glass animate-fade-in-up" style={{ padding: 24, animationDelay: `${i * 0.1}s`, transition: "all 0.3s ease" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-green)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--glass-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                <Star size={14} color="var(--warning)" fill="var(--warning)" />
                                                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>4.{(i % 5) + 5}</span>
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{item.restaurantName}</h3>
                                        </div>
                                        <div className={`badge ${scoreBadge(item.safetyScore)}`}>
                                            <ShieldCheck size={12} /> {item.safetyScore}%
                                        </div>
                                    </div>

                                    <div style={{ height: 120, borderRadius: 12, overflow: "hidden", marginBottom: 16, border: "1px solid var(--border-color)" }}>
                                        <img
                                            src={item.imageUrl || DEFAULT_CATEGORY_IMAGES[item.category] || DEFAULT_CATEGORY_IMAGES.vegetable}
                                            alt={item.foodType}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>

                                    <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{item.foodType}</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                                            <Scale size={14} /> {item.weightKg} kg
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                                            <MapPin size={14} /> {item.distance}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                            <Leaf size={14} /> {item.suitableFor.split(",")[0]}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-dim)" }}>
                                            <Clock size={14} /> {(i % 3) + 1}h ago
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
                                        <div>
                                            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-green)" }}>Rs {item.price}</span>
                                            <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 4 }}>/ lot</span>
                                        </div>
                                        <button className="btn-primary" onClick={() => setConfirmItem(item)}
                                            style={{ padding: "10px 20px", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                            <ShoppingCart size={16} /> Buy
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="glass" style={{ padding: 48, textAlign: "center", gridColumn: "1 / -1" }}>
                                    <Package size={40} color="var(--text-dim)" style={{ marginBottom: 16, opacity: 0.5 }} />
                                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No listings found</p>
                                    <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Try adjusting your filters or check back later</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Purchases Tab */}
                {tab === "purchases" && (
                    <div>
                        {myPurchases.length === 0 ? (
                            <div className="glass" style={{ padding: 48, textAlign: "center" }}>
                                <Truck size={40} color="var(--text-dim)" style={{ marginBottom: 16, opacity: 0.5 }} />
                                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No purchases yet</p>
                                <p style={{ fontSize: 14, color: "var(--text-dim)" }}>Browse the marketplace and buy some feed!</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: 16 }}>
                                {myPurchases.map(item => (
                                    <div key={item.id} className="glass-sm animate-slide-in" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: item.status === "picked_up" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {item.status === "picked_up" ? <CheckCircle2 size={22} color="var(--accent-green)" /> : <Truck size={22} color="var(--warning)" />}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 15 }}>{item.foodType}</p>
                                                <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{item.restaurantName} - {item.weightKg} kg - Rs {item.price}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div className={`badge ${item.status === "picked_up" ? "badge-safe" : "badge-moderate"}`}>
                                                {item.status === "picked_up" ? <><CheckCircle2 size={12} /> Picked Up</> : "Awaiting Pickup"}
                                            </div>
                                            {item.status === "sold" && (
                                                <button className="btn-primary" onClick={() => handlePickup(item.id)} disabled={processingId === item.id}
                                                    style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                    {processingId === item.id ? "Confirming..." : <><Camera size={15} /> Confirm Pickup</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Purchase Confirmation Modal ── */}
            {confirmItem && (
                <div
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                        animation: "fadeIn 0.2s ease",
                    }}
                    onClick={() => setConfirmItem(null)}
                >
                    <div
                        className="glass animate-fade-in-up"
                        style={{
                            width: "100%", maxWidth: 480, padding: 32,
                            border: "1px solid var(--glass-border)",
                            background: "var(--glass-bg)", borderRadius: 20,
                            boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ShoppingCart size={22} color="var(--accent-green)" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Confirm Purchase</h2>
                                    <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Review details before buying</p>
                                </div>
                            </div>
                            <button onClick={() => setConfirmItem(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-dim)", transition: "all 0.2s ease" }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Product Details */}
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                                <div>
                                    <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{confirmItem.foodType}</p>
                                    <p style={{ fontSize: 13, color: "var(--text-dim)" }}>from {confirmItem.restaurantName}</p>
                                </div>
                                <div className={`badge ${scoreBadge(confirmItem.safetyScore)}`}>
                                    <ShieldCheck size={12} /> {confirmItem.safetyScore}%
                                </div>
                            </div>

                            {/* Item Image */}
                            <div style={{ height: 140, borderRadius: 12, overflow: "hidden", marginBottom: 16, border: "1px solid var(--border-color)" }}>
                                <img
                                    src={confirmItem.imageUrl || DEFAULT_CATEGORY_IMAGES[confirmItem.category] || DEFAULT_CATEGORY_IMAGES.vegetable}
                                    alt={confirmItem.foodType}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                                    <Scale size={15} color="var(--accent-cyan)" />
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Weight</div>
                                        <div style={{ fontWeight: 600 }}>{confirmItem.weightKg} kg</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                                    <MapPin size={15} color="var(--accent-emerald)" />
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Distance</div>
                                        <div style={{ fontWeight: 600 }}>{confirmItem.distance}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                                    <Leaf size={15} color="var(--accent-green)" />
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Suitable For</div>
                                        <div style={{ fontWeight: 600 }}>{confirmItem.suitableFor}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                                    <Leaf size={15} color="var(--accent-lime)" />
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>CO₂ Saved</div>
                                        <div style={{ fontWeight: 600 }}>{(confirmItem.weightKg * 2.5).toFixed(1)} kg</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Total Price</span>
                            <span style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-green)" }}>Rs {confirmItem.price}</span>
                        </div>

                        {/* Caution */}
                        <div style={{ display: "flex", alignItems: "start", gap: 10, padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, marginBottom: 24, fontSize: 12, color: "var(--warning)" }}>
                            <AlertTriangle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                            <span>By confirming, you agree to pick up this item from the restaurant. This action cannot be undone.</span>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 12 }}>
                            <button
                                onClick={() => setConfirmItem(null)}
                                style={{
                                    flex: 1, padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                                    border: "1px solid var(--border-color)", background: "transparent",
                                    color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s ease",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => handleBuy(confirmItem.id)}
                                disabled={processingId === confirmItem.id}
                                style={{
                                    flex: 2, padding: "14px 20px", fontSize: 14,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    opacity: processingId === confirmItem.id ? 0.7 : 1,
                                }}
                            >
                                {processingId === confirmItem.id ? "Processing..." : <><CheckCircle2 size={18} /> Confirm Purchase</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

