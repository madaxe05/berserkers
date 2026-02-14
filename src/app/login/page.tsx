"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/lib/types";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Users } from "lucide-react";
import Image from "next/image";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") as UserRole | null;
    const { setRole, setUserName } = useApp();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const selectedRole = roleParam || "restaurant";

    const handleAuth = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");

        const authEmail = overrideEmail || email;
        const authPassword = overridePassword || password;

        try {
            let user;
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                user = userCredential.user;
                const displayName = name || authEmail.split("@")[0];
                await updateProfile(user, { displayName });
                setUserName(displayName);

                // Store role in Firestore so this account is locked to this role
                await setDoc(doc(db, "users", user.uid), {
                    email: authEmail,
                    displayName,
                    role: selectedRole,
                    createdAt: new Date().toISOString(),
                });
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
                user = userCredential.user;

                // Check stored role — must match selected role (admin exempt)
                if (selectedRole !== "admin") {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const storedRole = userDoc.data().role;
                        if (storedRole && storedRole !== selectedRole) {
                            await auth.signOut();
                            setError(`This account is registered as "${storedRole}". Please select the correct role.`);
                            setLoading(false);
                            return;
                        }
                    }
                }

                setUserName(user.displayName || authEmail.split("@")[0]);
            }

            // Update App Context
            setRole(selectedRole);

            // Redirect
            const routes: Record<string, string> = { restaurant: "/restaurant", farmer: "/farmer", admin: "/dashboard" };
            router.push(routes[selectedRole]);

        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Invalid email or password.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Email already in use. Try logging in.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else if (err.code === 'auth/network-request-failed') {
                setError("Network error. Check your connection.");
            } else {
                setError(err.message || "Authentication failed. Check console.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = async () => {
        const demoEmail = "demo@anna-chain.com";
        const demoPassword = "password123";
        setEmail(demoEmail);
        setPassword(demoPassword);
        setLoading(true);
        setError("");

        try {
            // Try signing in first
            const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
            const user = userCredential.user;

            // For demo accounts, skip role check — allow any role
            setUserName(user.displayName || "Demo User");
            setRole(selectedRole);
            const routes: Record<string, string> = { restaurant: "/restaurant", farmer: "/farmer", admin: "/dashboard" };
            router.push(routes[selectedRole]);
        } catch (signInErr: any) {
            // If account doesn't exist, create it
            if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found') {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
                    const user = userCredential.user;
                    await updateProfile(user, { displayName: "Demo User" });

                    await setDoc(doc(db, "users", user.uid), {
                        email: demoEmail,
                        displayName: "Demo User",
                        role: "demo",
                        createdAt: new Date().toISOString(),
                    });

                    setUserName("Demo User");
                    setRole(selectedRole);
                    const routes: Record<string, string> = { restaurant: "/restaurant", farmer: "/farmer", admin: "/dashboard" };
                    router.push(routes[selectedRole]);
                } catch (createErr: any) {
                    console.error("Demo account creation error:", createErr);
                    setError("Failed to create demo account. Please try again.");
                }
            } else {
                console.error("Demo login error:", signInErr);
                setError("Demo login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: 20 }}>
            <div className="glass animate-fade-in-up" style={{ width: "100%", maxWidth: 420, padding: 40, border: "1px solid var(--glass-border)", background: "var(--glass-bg)", borderRadius: 24, boxShadow: "0 20px 80px rgba(0,0,0,0.4)" }}>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 32 }}>
                    <Image src="/images/logo.png" alt="Anna-Chain Logo" width={160} height={160} style={{ borderRadius: 16, marginBottom: 16 }} priority />
                    <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
                        {isRegistering ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
                        {isRegistering ? "Sign up" : "Login"} as <span style={{ color: "var(--accent-green)", fontWeight: 600, textTransform: "capitalize" }}>{selectedRole}</span>
                    </p>
                </div>

                <form onSubmit={handleAuth} style={{ display: "grid", gap: 20 }}>

                    {error && (
                        <div className="animate-fade-in" style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid var(--danger)", color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {isRegistering && (
                        <div className="animate-fade-in">
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Organization / Name</label>
                            <div style={{ position: "relative" }}>
                                <Users size={18} color="var(--text-dim)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. Green Valley Farm"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ paddingLeft: 42 }}
                                />
                            </div>
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
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>{isRegistering ? "Create Account" : "Login"} <ArrowRight size={18} /></>}
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            style={{ color: "var(--accent-green)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}
                        >
                            {isRegistering ? "Back to Login" : "Need an account? Register"}
                        </button>
                        <button
                            type="button"
                            onClick={fillDemo}
                            disabled={loading}
                            style={{ color: "var(--text-dim)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", opacity: loading ? 0.5 : 1 }}
                        >
                            {loading ? "Loading..." : "Use Demo"}
                        </button>
                    </div>

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
