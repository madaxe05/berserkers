"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { ShoppingCart, MapPin, Scale, ShieldCheck, CheckCircle2, Camera, Truck, Package, Filter, Search, Leaf, Star, Clock } from "lucide-react";
import { useState } from "react";

export default function FarmerPage() {
    const { wasteItems, buyItem, confirmPickup, userName } = useApp();
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [pickupId, setPickupId] = useState<string | null>(null);
    const [pickupDone, setPickupDone] = useState<Set<string>>(new Set());

    const listedItems = wasteItems.filter(i => i.status === "listed" && i.safetyScore >= 60);
    const myPurchases = wasteItems.filter(i => (i.status === "sold" || i.status === "picked_up") && i.buyerName === userName);

    const filtered = listedItems.filter(i => {
        if (filter !== "all" && i.category !== filter) return false;
        if (search && !i.foodType.toLowerCase().includes(search.toLowerCase()) && !i.restaurantName.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    function handleBuy(id: string) {
        setBuyingId(id);
        setTimeout(() => {
            buyItem(id);
            setBuyingId(null);
        }, 1500);
    }

    function handlePickup(id: string) {
        setPickupId(id);
        setTimeout(() => {
            confirmPickup(id);
            setPickupDone(prev => new Set(prev).add(id));
            setPickupId(null);
        }, 1800);
    }

    const scoreColor = (score: number) => score >= 80 ? "var(--accent-green)" : score >= 60 ? "var(--warning)" : "var(--danger)";
    const scoreBadge = (score: number) => score >= 80 ? "badge-safe" : score >= 60 ? "badge-moderate" : "badge-unsafe";

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

                {/* Filters */}
                <div className="glass-sm" style={{ padding: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                        <Search size={16} color="var(--text-dim)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                        <input className="input-field" placeholder="Search by food or restaurant..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { key: "all", label: "All" },
                            { key: "vegetable", label: "🥬 Veg" },
                            { key: "grain", label: "🌾 Grain" },
                            { key: "bread", label: "🍞 Bread" },
                            { key: "mixed", label: "🍱 Mixed" },
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                style={{
                                    padding: "8px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    border: filter === f.key ? "1.5px solid var(--accent-green)" : "1.5px solid var(--border-color)",
                                    background: filter === f.key ? "rgba(34,197,94,0.15)" : "transparent",
                                    color: filter === f.key ? "var(--accent-green)" : "var(--text-dim)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Marketplace grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 48 }}>
                    {filtered.map((item, i) => (
                        <div key={item.id} className="glass animate-fade-in-up" style={{ padding: 24, animationDelay: `${i * 0.1}s`, transition: "all 0.3s ease" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-green)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--glass-border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                        >
                            {/* Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                        <Star size={14} color="var(--warning)" fill="var(--warning)" />
                                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>4.{Math.floor(Math.random() * 5 + 5)}</span>
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{item.restaurantName}</h3>
                                </div>
                                <div className={`badge ${scoreBadge(item.safetyScore)}`}>
                                    <ShieldCheck size={12} /> {item.safetyScore}%
                                </div>
                            </div>

                            {/* Image placeholder */}
                            <div style={{ height: 120, borderRadius: 12, background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1px solid var(--border-color)" }}>
                                <Package size={32} color="var(--accent-green)" style={{ opacity: 0.5 }} />
                            </div>

                            {/* Info */}
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
                                    <Clock size={14} /> {Math.floor(Math.random() * 3 + 1)}h ago
                                </div>
                            </div>

                            {/* Price + Buy */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
                                <div>
                                    <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "var(--accent-green)" }}>Rs {item.price}</span>
                                    <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 4 }}>/ lot</span>
                                </div>
                                <button className="btn-primary" onClick={() => handleBuy(item.id)} disabled={buyingId === item.id}
                                    style={{ padding: "10px 20px", fontSize: 14, opacity: buyingId === item.id ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                                    {buyingId === item.id ? "Processing..." : <><ShoppingCart size={16} /> Buy</>}
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

                {/* ── My Purchases ────────────────────────────── */}
                {myPurchases.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                            <Truck size={22} color="var(--accent-emerald)" /> My Purchases
                        </h2>
                        <div style={{ display: "grid", gap: 16 }}>
                            {myPurchases.map(item => (
                                <div key={item.id} className="glass-sm animate-slide-in" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: item.status === "picked_up" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {item.status === "picked_up" ? <CheckCircle2 size={22} color="var(--accent-green)" /> : <Truck size={22} color="var(--warning)" />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 15 }}>{item.foodType}</p>
                                            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{item.restaurantName} • {item.weightKg} kg • Rs {item.price}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div className={`badge ${item.status === "picked_up" ? "badge-safe" : "badge-moderate"}`}>
                                            {item.status === "picked_up" ? "✓ Picked Up" : "Awaiting Pickup"}
                                        </div>
                                        {item.status === "sold" && (
                                            <button className="btn-primary" onClick={() => handlePickup(item.id)} disabled={pickupId === item.id}
                                                style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                {pickupId === item.id ? "Confirming..." : <><Camera size={15} /> Confirm Pickup</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
