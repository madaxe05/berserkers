"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Leaf, Recycle, TrendingUp, Users, Activity, Zap, CheckCircle, Clock, Star } from "lucide-react";
import { calculateCO2 } from "@/lib/utils";

export default function DashboardPage() {
  const {
    totalWasteDiverted,
    totalCO2Saved,
    totalTransactions,
    totalFarmersSupported,
    wasteByMonth,
    wasteByCategory,
    listingStats,
    topRestaurants
  } = useApp();

  // Helper to find max value for bar chart scaling
  const maxWasteMonth = Math.max(...wasteByMonth.map(m => m.waste), 10); // Minimum 10 to avoid div by zero
  const maxCO2Month = Math.max(...wasteByMonth.map(m => m.co2), 10);

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Navbar />

      <div className="container-app" style={{ paddingTop: 32, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={22} color="var(--accent-cyan)" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Impact Dashboard</h1>
              <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Real-time sustainability metrics & carbon tracking</p>
            </div>
          </div>
          <div className="glass" style={{ padding: "8px 16px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 10px var(--accent-green)" }}></div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-green)" }}>Live</span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 }}>

          <MetricCard
            icon={<Leaf size={24} color="var(--accent-green)" />}
            color="var(--accent-green)"
            bg="rgba(34,197,94,0.1)"
            label="Total Waste Diverted"
            value={`${totalWasteDiverted.toFixed(0)} kg`}
            trend="+18%"
          />
          <MetricCard
            icon={<Recycle size={24} color="var(--accent-emerald)" />}
            color="var(--accent-emerald)"
            bg="rgba(16,185,129,0.1)"
            label="CO₂ Emissions Saved"
            value={`${totalCO2Saved.toFixed(0)} kg`}
            trend="+22%"
          />
          <MetricCard
            icon={<Users size={24} color="var(--accent-cyan)" />}
            color="var(--accent-cyan)"
            bg="rgba(6,182,212,0.1)"
            label="Farmers Supported"
            value={totalFarmersSupported}
            trend="+3"
          />
          <MetricCard
            icon={<Activity size={24} color="var(--accent-lime)" />}
            color="var(--accent-lime)"
            bg="rgba(132,204,22,0.1)"
            label="Total Transactions"
            value={totalTransactions}
            trend="+12%"
          />

        </div>

        {/* Charts Row */}
        <div className="grid-responsive-2" style={{ gap: 24, marginBottom: 24 }}>

          {/* Waste Diverted Chart */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <Leaf size={18} color="var(--accent-green)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Waste Diverted</h3>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>Last 7 months</span>
            </div>

            <div style={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, paddingTop: 20 }}>
              {wasteByMonth.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 8, height: "100%" }}>
                  <div
                    className="bar-animate"
                    style={{
                      width: "100%",
                      maxWidth: 40,
                      height: `${Math.max((m.waste / maxWasteMonth) * 160, m.waste > 0 ? 4 : 0)}px`,
                      background: i === wasteByMonth.length - 1 ? "var(--accent-green)" : "rgba(34,197,94,0.2)",
                      borderRadius: "6px 6px 2px 2px",
                      position: "relative",
                      transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {m.waste > 0 && (
                      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--accent-green)", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {m.waste}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CO2 Saved Chart */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <Recycle size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>CO₂ Saved</h3>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-dim)" }}>Last 7 months</span>
            </div>

            <div style={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, paddingTop: 20 }}>
              {wasteByMonth.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 8, height: "100%" }}>
                  <div
                    className="bar-animate"
                    style={{
                      width: "100%",
                      maxWidth: 40,
                      height: `${Math.max((m.co2 / maxCO2Month) * 160, m.co2 > 0 ? 4 : 0)}px`,
                      background: i === wasteByMonth.length - 1 ? "var(--accent-emerald)" : "rgba(16,185,129,0.2)",
                      borderRadius: "6px 6px 2px 2px",
                      position: "relative",
                      transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {m.co2 > 0 && (
                      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--accent-emerald)", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {m.co2.toFixed(0)}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row: Distribution & Status */}
        <div className="grid-responsive-2" style={{ gap: 24, marginBottom: 40 }}>

          {/* Category Distribution */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--accent-cyan)", display: "grid", placeItems: "center" }}>
                <div style={{ width: 10, height: 10, background: "var(--accent-cyan)", borderRadius: "50%" }}></div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Waste Category Distribution</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {wasteByCategory.length > 0 ? wasteByCategory.map((cat, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: "var(--text-primary)" }}>{cat.name}</span>
                    <span style={{ color: "var(--accent-green)" }}>{cat.value}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                    <div style={{ width: `${cat.value}%`, height: "100%", background: getCategoryColor(i), borderRadius: 10 }}></div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 20, fontSize: 13 }}>No data available</div>
              )}
            </div>
          </div>

          {/* Listing Status & Equivalents */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div className="glass" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Activity size={18} color="var(--accent-lime)" />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Listing Status</h3>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <StatusRow label="Active Listings" count={listingStats.active} icon={<Zap size={16} />} color="var(--accent-cyan)" />
                <StatusRow label="Sold (Awaiting Pickup)" count={listingStats.sold} icon={<Clock size={16} />} color="var(--accent-orange)" />
                <StatusRow label="Completed" count={listingStats.completed} icon={<CheckCircle size={16} />} color="var(--accent-green)" />
              </div>
            </div>



          </div>
        </div>

        {/* Top Restaurants Table */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent-orange)", display: "grid", placeItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: "bold", color: "#000" }}>R</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Top Restaurants</h3>
            </div>
            <button className="btn-secondary" style={{ padding: "6px 16px", fontSize: 12 }}>Sustainability Leaders</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", width: 50 }}>#</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Restaurant</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Waste (kg)</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Rating</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Carbon Credits</th>
                </tr>
              </thead>
              <tbody>
                {topRestaurants.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? "var(--accent-orange)" : i === 1 ? "#cbd5e1" : i === 2 ? "#d1d5db" : "rgba(255,255,255,0.1)", color: i < 3 ? "#000" : "var(--text-dim)", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>
                        {i + 1}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: "16px", color: "var(--accent-green)" }}>{r.waste}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ color: "var(--accent-orange)", marginRight: 4, display: "inline-flex" }}><Star size={14} fill="var(--accent-orange)" /></span> {r.rating.toFixed(1)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.1)", color: "var(--accent-green)", fontSize: 12, fontWeight: 600, border: "1px solid rgba(34,197,94,0.2)" }}>
                        {(r.co2).toFixed(0)} credits
                      </div>
                    </td>
                  </tr>
                ))}
                {topRestaurants.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-dim)" }}>No active restaurants yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, color, bg, label, value, trend }: any) {
  return (
    <div className="glass" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 24, right: 24, fontSize: 12, color: "var(--accent-green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
        <TrendingUp size={12} /> {trend}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{label}</h2>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function StatusRow({ label, count, icon, color }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, color: color, display: "grid", placeItems: "center" }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{count}</span>
    </div>
  );
}

function getCategoryColor(index: number) {
  const colors = ["var(--accent-green)", "var(--accent-cyan)", "var(--accent-lime)", "var(--accent-emerald)", "var(--accent-teal)"];
  return colors[index % colors.length];
}
