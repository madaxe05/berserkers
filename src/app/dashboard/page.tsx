"use client";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Leaf, Recycle, TrendingUp } from "lucide-react";
import { calculateCO2 } from "@/lib/utils";

export default function DashboardPage() {
  const { totalWasteDiverted, totalCO2Saved, totalTransactions, totalFarmersSupported } = useApp();

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Navbar />

      <div className="container-app" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Environmental Impact Dashboard</h1>
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Real-time monitoring of food waste redistribution impact</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}>

          {/* Waste Diverted */}
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Leaf size={24} color="var(--accent-green)" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Total Waste Diverted</h2>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent-green)", fontFamily: "'Space Grotesk', sans-serif" }}>
              {totalWasteDiverted.toFixed(1)} <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-dim)" }}>kg</span>
            </div>
          </div>

          {/* CO2 Saved */}
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Recycle size={24} color="var(--accent-emerald)" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>CO₂ Emissions Prevented</h2>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent-emerald)", fontFamily: "'Space Grotesk', sans-serif" }}>
              {totalCO2Saved.toFixed(1)} <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-dim)" }}>kg</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="glass" style={{ padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <TrendingUp size={24} color="var(--accent-cyan)" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Community Participation</h2>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{totalTransactions}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase" }}>Pickups</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{totalFarmersSupported}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase" }}>Farmers</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
