"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/lib/types";
import { Recycle, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") as UserRole | null;
    const { setRole, setUserName } = useApp();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const selectedRole = roleParam || "restaurant";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Ensure user role matches the selected login type (simple validation for hackathon)
            // In production, user roles would be stored in Firestore 'users' collection

            // Update App Context
            setRole(selectedRole);
            setUserName(user.displayName || email.split("@")[0]);

            // Redirect
            const routes = { restaurant: "/restaurant", farmer: "/farmer", admin: "/dashboard" };
            router.push(routes[selectedRole]);

        } catch (err: any) {
            console.error("Login error:", err);
            setError("Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Demo helper for hackathon judges
    const fillDemo = () => {
        setEmail("demo@anna-chain.com");
        setPassword("password123");
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: 20 }}>
            {/* Background Particles (Optional: reuse from layout if global) */}

            <div className="glass animate-fade-in-up" style={{ width: "100%", maxWidth: 420, padding: 40, border: "1px solid var(--glass-border)", background: "var(--glass-bg)", borderRadius: 24, boxShadow: "0 20px 80px rgba(0,0,0,0.4)" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--gradient-green)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <Recycle size={32} color="#0a0f0d" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
                        Login to continue as <span style={{ color: "var(--accent-green)", fontWeight: 600, textTransform: "capitalize" }}>{selectedRole}</span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: "grid", gap: 20 }}>

                    {error && (
                        <div className="animate-fade-in" style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Email Address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} color="var(--text-dim)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ paddingLeft: 42 }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} color="var(--text-dim)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingLeft: 42 }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Login to Dashboard <ArrowRight size={18} /></>}
                    </button>

                    <button
                        type="button"
                        onClick={fillDemo}
                        style={{ fontSize: 13, color: "var(--text-dim)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Use Demo Credentials (Hackathon Only)
                    </button>

                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color="var(--accent-green)" size={32} /></div>}>
            <LoginForm />
        </Suspense>
    );
}
