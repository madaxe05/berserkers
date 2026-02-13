"use client";

import { useApp } from "@/context/AppContext";
import { Leaf, Store, Tractor, ShieldCheck, ArrowRight, Recycle, TrendingUp, Globe, Trees, Droplets, Flame, Car } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { setRole, setUserName } = useApp();
  const router = useRouter();

  function login(role: "restaurant" | "farmer" | "admin") {
    router.push(`/login?role=${role}`);
  }

  return (
    <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 900, textAlign: "center" }}>
          {/* Logo mark */}
          <div className="animate-fade-in" style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gradient-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Recycle size={30} color="#0a0f0d" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}>
              <span className="gradient-text">Anna</span><span style={{ color: "var(--text-primary)" }}>-Chain</span>
            </span>
          </div>

          <h1 className="animate-fade-in-up" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>
            Transforming <span className="gradient-text">Food Waste</span> into{" "}
            <span className="gradient-text">Value</span>
          </h1>

          <p className="animate-fade-in-up stagger-1" style={{ fontSize: 18, color: "var(--text-dim)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.6 }}>
            Connect restaurants with farmers. Reduce methane emissions. Build a circular economy — one meal at a time.
          </p>

          {/* ── Role Cards ────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, maxWidth: 780, margin: "0 auto" }}>
            {/* Restaurant */}
            <button onClick={() => login("restaurant")} className="glass animate-fade-in-up stagger-2" style={{ padding: "32px 24px", cursor: "pointer", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", textAlign: "left", transition: "all 0.3s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-green)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px var(--accent-green-glow)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Store size={24} color="var(--accent-green)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Restaurant</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>Upload food waste, earn revenue & carbon credits</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-green)", fontSize: 14, fontWeight: 600 }}>
                Login <ArrowRight size={16} />
              </div>
            </button>

            {/* Farmer */}
            <button onClick={() => login("farmer")} className="glass animate-fade-in-up stagger-3" style={{ padding: "32px 24px", cursor: "pointer", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", textAlign: "left", transition: "all 0.3s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-emerald)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(16,185,129,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Tractor size={24} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Farmer</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>Browse affordable feed from nearby restaurants</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-emerald)", fontSize: 14, fontWeight: 600 }}>
                Login <ArrowRight size={16} />
              </div>
            </button>

            {/* Admin */}
            <button onClick={() => login("admin")} className="glass animate-fade-in-up stagger-4" style={{ padding: "32px 24px", cursor: "pointer", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", textAlign: "left", transition: "all 0.3s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-cyan)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(6,182,212,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--glass-border)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <ShieldCheck size={24} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Admin</h3>
              <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>Impact dashboard & waste monitoring</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-cyan)", fontSize: 14, fontWeight: 600 }}>
                Login <ArrowRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <section className="animate-fade-in stagger-5" style={{ padding: "40px 24px 48px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          {[
            { icon: <Recycle size={20} />, label: "Waste Diverted", value: `${useApp().totalWasteDiverted.toFixed(0)} kg` },
            { icon: <Leaf size={20} />, label: "CO₂ Saved", value: `${useApp().totalCO2Saved.toFixed(0)} kg` },
            { icon: <Tractor size={20} />, label: "Farmers Helped", value: useApp().totalFarmersSupported.toString() },
          ].map((s, i) => (
            <div key={i} className="glass-sm" style={{ padding: "20px 16px", textAlign: "center" }}>
              <div style={{ color: "var(--accent-green)", marginBottom: 8, display: "flex", justifyContent: "center" }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Environmental Equivalents ─────────────────── */}
      <section className="animate-fade-in stagger-6" style={{ padding: "0 24px 60px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div className="glass" style={{ padding: 32 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 24, textAlign: "center" }}>Our Impact</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <Trees size={24} color="var(--accent-green)" />
                <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--accent-green)", fontSize: 18 }}>{(useApp().totalCO2Saved / 20).toFixed(0)}</strong>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Trees Planted</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <Droplets size={24} color="var(--accent-cyan)" />
                <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--accent-cyan)", fontSize: 18 }}>{(useApp().totalWasteDiverted * 8).toFixed(0)}L</strong>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Water Saved</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <Flame size={24} color="var(--accent-orange)" />
                <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--accent-orange)", fontSize: 18 }}>{(useApp().totalWasteDiverted * 0.54).toFixed(1)} kg</strong>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Methane Avoided</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                <Car size={24} color="var(--accent-emerald)" />
                <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--accent-emerald)", fontSize: 18 }}>{(useApp().totalCO2Saved / 40).toFixed(1)}</strong>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Car-Days Offset</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-dim)", fontSize: 13 }}>
          <Globe size={14} />
          <span>Anna-Chain — Circular Economy for Nepal</span>
          <Leaf size={14} color="var(--accent-green)" />
        </div>
      </footer>
    </main>
  );
}
