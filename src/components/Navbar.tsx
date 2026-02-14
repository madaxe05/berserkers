"use client";

import { useApp } from "@/context/AppContext";
import { UserRole } from "@/lib/types";
import { Store, Tractor, BarChart3, LogOut, Leaf } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
    const { role, userName, setRole } = useApp();
    const router = useRouter();
    const pathname = usePathname();

    function logout() {
        setRole(null);
        router.push("/");
    }

    const navLinks: { label: string; href: string; icon: React.ReactNode; roles: UserRole[] }[] = [
        { label: "Upload", href: "/restaurant", icon: <Store size={16} />, roles: ["restaurant"] },
        { label: "Marketplace", href: "/farmer", icon: <Tractor size={16} />, roles: ["farmer"] },
        { label: "Dashboard", href: "/dashboard", icon: <BarChart3 size={16} />, roles: ["admin"] },
    ];

    const visibleLinks = navLinks.filter(l => role && l.roles.includes(role));

    return (
        <nav className="navbar">
            <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
                {/* Logo */}
                <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>
                    <Image src="/images/logo.png" alt="Anna-Chain Logo" width={54} height={54} style={{ borderRadius: 8 }} priority />
                    <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}>
                        <span className="gradient-text">Anna</span>-Chain
                    </span>
                </button>

                {/* Nav Links */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {visibleLinks.map(link => {
                        const active = pathname === link.href;
                        return (
                            <button key={link.href} onClick={() => router.push(link.href)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6,
                                    padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                                    border: "none", cursor: "pointer",
                                    background: active ? "rgba(34,197,94,0.15)" : "transparent",
                                    color: active ? "var(--accent-green)" : "var(--text-dim)",
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
                                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}
                            >
                                {link.icon} {link.label}
                            </button>
                        );
                    })}
                </div>

                {/* User + Logout */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {role && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Leaf size={14} color="var(--accent-green)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{userName}</p>
                                    <p style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "capitalize" }}>{role}</p>
                                </div>
                            </div>
                            <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-dim)", cursor: "pointer", transition: "all 0.2s ease" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--danger)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
