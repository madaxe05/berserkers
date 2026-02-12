"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { BarChart3, Leaf, Recycle, TrendingUp, Users, Award, Globe, Zap, ArrowUpRight, ArrowDownRight, Activity, Target, TreePine, Flame, Droplets } from "lucide-react";

export default function DashboardPage() {
    const { totalWasteDiverted, totalCO2Saved, totalFarmersSupported, totalTransactions, wasteItems } = useApp();

    const listed = wasteItems.filter(i => i.status === "listed").length;
    const sold = wasteItems.filter(i => i.status === "sold").length;
    const pickedUp = wasteItems.filter(i => i.status === "picked_up").length;

    // Fake monthly data
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
    const wasteByMonth = [45, 67, 89, 120, 156, 192, totalWasteDiverted];
    const co2ByMonth = wasteByMonth.map(w => w * 2.5);
    const maxWaste = Math.max(...wasteByMonth);
    const maxCO2 = Math.max(...co2ByMonth);

    // Fake top restaurants
    const topRestaurants = [
        { name: "Himalayan Café", waste: 45, score: 4.8, credits: 112 },
        { name: "Kathmandu Kitchen", waste: 38, score: 4.6, credits: 95 },
        { name: "Newari Bhoj", waste: 32, score: 4.5, credits: 80 },
        { name: "Everest Dine", waste: 28, score: 4.3, credits: 70 },
        { name: "Thamel Bites", waste: 24, score: 4.1, credits: 60 },
    ];

    // Fake category distribution
    const categories = [
        { name: "Vegetable", pct: 42, color: "var(--accent-green)" },
        { name: "Grain/Rice", pct: 28, color: "var(--accent-emerald)" },
        { name: "Bread", pct: 15, color: "var(--accent-lime)" },
        { name: "Mixed", pct: 12, color: "var(--accent-cyan)" },
        { name: "Other", pct: 3, color: "var(--text-dim)" },
    ];

    return (
        <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
            <Navbar />
            <div className="container-app" style={{ paddingTop: 32, paddingBottom: 60 }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BarChart3 size={22} color="var(--accent-cyan)" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Impact Dashboard</h1>
                            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Real-time sustainability metrics & carbon tracking</p>
                        </div>
                    </div>
                    <div className="badge badge-safe" style={{ fontSize: 13, padding: "6px 16px" }}>
                        <Activity size={14} /> Live
                    </div>
                </div>

                {/* ── Hero Stats ──────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                    {[
                        { icon: <Recycle size={24} />, label: "Total Waste Diverted", value: `${totalWasteDiverted.toLocaleString()} kg`, change: "+18%", up: true, color: "var(--accent-green)", bg: "rgba(34,197,94,0.12)" },
                        { icon: <Leaf size={24} />, label: "CO₂ Emissions Saved", value: `${totalCO2Saved.toLocaleString()} kg`, change: "+22%", up: true, color: "var(--accent-emerald)", bg: "rgba(16,185,129,0.12)" },
                        { icon: <Users size={24} />, label: "Farmers Supported", value: totalFarmersSupported.toString(), change: "+3", up: true, color: "var(--accent-cyan)", bg: "rgba(6,182,212,0.12)" },
                        { icon: <TrendingUp size={24} />, label: "Total Transactions", value: totalTransactions.toString(), change: "+12%", up: true, color: "var(--accent-lime)", bg: "rgba(132,204,22,0.12)" },
                    ].map((stat, i) => (
                        <div key={i} className="glass stat-card animate-fade-in-up" style={{ padding: 24, animationDelay: `${i * 0.1}s` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: stat.up ? "var(--accent-green)" : "var(--danger)" }}>
                                    {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="animate-count" style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4, animationDelay: `${i * 0.15 + 0.3}s` }}>
                                {stat.value}
                            </div>
                            <p style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 500 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row ──────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                    {/* Waste Diverted Chart */}
                    <div className="glass animate-fade-in-up stagger-2" style={{ padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Recycle size={18} color="var(--accent-green)" /> Waste Diverted</h3>
                            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Last 7 months</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, paddingBottom: 24 }}>
                            {wasteByMonth.map((v, i) => (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-green)" }}>{v}</span>
                                    <div style={{ width: "100%", height: `${(v / maxWaste) * 120}px`, borderRadius: 6, background: i === wasteByMonth.length - 1 ? "var(--gradient-green)" : "rgba(34,197,94,0.25)", transition: "height 0.8s ease", animationDelay: `${i * 0.1}s` }} />
                                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{months[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CO₂ Saved Chart */}
                    <div className="glass animate-fade-in-up stagger-3" style={{ padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Leaf size={18} color="var(--accent-emerald)" /> CO₂ Saved</h3>
                            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Last 7 months</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, paddingBottom: 24 }}>
                            {co2ByMonth.map((v, i) => (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-emerald)" }}>{v.toFixed(0)}</span>
                                    <div style={{ width: "100%", height: `${(v / maxCO2) * 120}px`, borderRadius: 6, background: i === co2ByMonth.length - 1 ? "linear-gradient(135deg, #10b981, #06b6d4)" : "rgba(16,185,129,0.25)", transition: "height 0.8s ease" }} />
                                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{months[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Second Row ──────────────────────────────── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                    {/* Category Distribution */}
                    <div className="glass animate-fade-in-up stagger-4" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}><Target size={18} color="var(--accent-cyan)" /> Waste Category Distribution</h3>
                        <div style={{ display: "grid", gap: 14 }}>
                            {categories.map((c, i) => (
                                <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.pct}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: "var(--bg-secondary)", overflow: "hidden" }}>
                                        <div style={{ height: "100%", borderRadius: 3, background: c.color, width: `${c.pct}%`, transition: "width 1s ease" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Listing Status */}
                    <div className="glass animate-fade-in-up stagger-4" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}><Activity size={18} color="var(--accent-lime)" /> Listing Status</h3>
                        <div style={{ display: "grid", gap: 16 }}>
                            {[
                                { label: "Active Listings", value: listed, icon: <Zap size={18} />, color: "var(--accent-cyan)", bg: "rgba(6,182,212,0.12)" },
                                { label: "Sold (Awaiting Pickup)", value: sold, icon: <Flame size={18} />, color: "var(--warning)", bg: "rgba(245,158,11,0.12)" },
                                { label: "Completed", value: pickedUp + 14, icon: <Award size={18} />, color: "var(--accent-green)", bg: "rgba(34,197,94,0.12)" },
                            ].map((s, i) => (
                                <div key={i} className="glass-sm" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                                        {s.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 2 }}>{s.label}</p>
                                        <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Environmental equivalents */}
                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
                            <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Environmental Equivalents</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <TreePine size={16} color="var(--accent-green)" />
                                    <span style={{ color: "var(--text-dim)" }}>{Math.floor(totalCO2Saved / 22)} trees planted</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <Droplets size={16} color="var(--accent-cyan)" />
                                    <span style={{ color: "var(--text-dim)" }}>{(totalCO2Saved * 3.2).toLocaleString()}L water saved</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <Flame size={16} color="var(--warning)" />
                                    <span style={{ color: "var(--text-dim)" }}>{Math.floor(totalCO2Saved / 4.6)} kg methane avoided</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <Globe size={16} color="var(--accent-emerald)" />
                                    <span style={{ color: "var(--text-dim)" }}>{(totalCO2Saved / 411).toFixed(1)} car-days offset</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Top Restaurants ─────────────────────────── */}
                <div className="glass animate-fade-in-up stagger-5" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><Award size={18} color="var(--warning)" /> Top Restaurants</h3>
                        <span className="badge badge-neutral">Sustainability Leaders</span>
                    </div>
                    <div style={{ overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    {["#", "Restaurant", "Waste (kg)", "Rating", "Carbon Credits"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topRestaurants.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.05)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "14px 12px" }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : i === 1 ? "linear-gradient(135deg, #94a3b8, #64748b)" : i === 2 ? "linear-gradient(135deg, #d97706, #b45309)" : "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i < 3 ? "#0a0f0d" : "var(--text-dim)" }}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 12px", fontWeight: 600, fontSize: 14 }}>{r.name}</td>
                                        <td style={{ padding: "14px 12px", fontSize: 14, color: "var(--accent-green)" }}>{r.waste}</td>
                                        <td style={{ padding: "14px 12px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
                                                <span style={{ color: "var(--warning)" }}>★</span> {r.score}
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 12px" }}>
                                            <span className="badge badge-safe">{r.credits} credits</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
