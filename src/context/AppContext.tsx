"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

/* ── types ─────────────────────────────────────────────── */
export type UserRole = "restaurant" | "farmer" | "admin";

export interface WasteItem {
  id: string;
  restaurantName: string;
  foodType: string;
  category: "vegetable" | "grain" | "mixed" | "meat" | "dairy" | "bread";
  weightKg: number;
  safetyScore: number;
  suitableFor: string;
  price: number;
  distance: string;
  imageUrl: string;
  status: "listed" | "sold" | "picked_up";
  createdAt: string;
  buyerName?: string;
}

export interface AppState {
  role: UserRole | null;
  userName: string;
  wasteItems: WasteItem[];
  totalWasteDiverted: number;
  totalCO2Saved: number;
  totalFarmersSupported: number;
  totalTransactions: number;
}

interface AppContextType extends AppState {
  setRole: (role: UserRole | null) => void;
  setUserName: (name: string) => void;
  addWasteItem: (item: Omit<WasteItem, "id" | "status" | "createdAt">) => void;
  buyItem: (id: string) => void;
  confirmPickup: (id: string) => void;
  classifyWaste: (category: string) => { score: number; suitable: string; verdict: string };
}

/* ── fake AI classification ────────────────────────────── */
function classifyWaste(category: string) {
  const rules: Record<string, { score: number; suitable: string; verdict: string }> = {
    vegetable: { score: 95, suitable: "Pigs, Poultry, Cattle", verdict: "Safe — excellent for animal feed" },
    grain:     { score: 92, suitable: "Poultry, Cattle", verdict: "Safe — rich in carbohydrates" },
    bread:     { score: 88, suitable: "Pigs, Poultry", verdict: "Safe — good energy source" },
    mixed:     { score: 74, suitable: "Pigs", verdict: "Moderate — needs sorting" },
    dairy:     { score: 65, suitable: "Pigs (limited)", verdict: "Caution — check freshness" },
    meat:      { score: 40, suitable: "Not recommended", verdict: "Unsafe — risk of contamination" },
  };
  return rules[category] || { score: 70, suitable: "Pigs", verdict: "Moderate" };
}

/* ── seed data ─────────────────────────────────────────── */
const SEED_ITEMS: WasteItem[] = [
  { id: "s1", restaurantName: "Himalayan Café", foodType: "Vegetable Rice Mix", category: "vegetable", weightKg: 15, safetyScore: 94, suitableFor: "Pigs, Poultry, Cattle", price: 150, distance: "1.2 km", imageUrl: "", status: "listed", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "s2", restaurantName: "Kathmandu Kitchen", foodType: "Dal Bhat Leftovers", category: "grain", weightKg: 22, safetyScore: 91, suitableFor: "Poultry, Cattle", price: 200, distance: "2.5 km", imageUrl: "", status: "listed", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "s3", restaurantName: "Newari Bhoj", foodType: "Bread & Roti", category: "bread", weightKg: 8, safetyScore: 88, suitableFor: "Pigs, Poultry", price: 80, distance: "0.8 km", imageUrl: "", status: "listed", createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: "s4", restaurantName: "Everest Dine", foodType: "Mixed Curry Leftovers", category: "mixed", weightKg: 30, safetyScore: 76, suitableFor: "Pigs", price: 250, distance: "3.1 km", imageUrl: "", status: "listed", createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: "s5", restaurantName: "Thamel Bites", foodType: "Fruit & Vegetable Scraps", category: "vegetable", weightKg: 12, safetyScore: 96, suitableFor: "Pigs, Poultry, Cattle", price: 120, distance: "1.8 km", imageUrl: "", status: "sold", createdAt: new Date(Date.now() - 86400000).toISOString(), buyerName: "Ram Thapa" },
  { id: "s6", restaurantName: "Garden of Dreams Café", foodType: "Salad & Greens", category: "vegetable", weightKg: 18, safetyScore: 97, suitableFor: "Pigs, Poultry, Cattle", price: 160, distance: "0.5 km", imageUrl: "", status: "picked_up", createdAt: new Date(Date.now() - 172800000).toISOString(), buyerName: "Sita Gurung" },
];

/* ── provider ──────────────────────────────────────────── */
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");
  const [wasteItems, setWasteItems] = useState<WasteItem[]>(SEED_ITEMS);

  const totalWasteDiverted = wasteItems.filter(i => i.status !== "listed").reduce((s, i) => s + i.weightKg, 0) + 120;
  const totalCO2Saved = totalWasteDiverted * 2.5;
  const totalFarmersSupported = 8;
  const totalTransactions = wasteItems.filter(i => i.status !== "listed").length + 14;

  function addWasteItem(item: Omit<WasteItem, "id" | "status" | "createdAt">) {
    const newItem: WasteItem = {
      ...item,
      id: "w" + Date.now(),
      status: "listed",
      createdAt: new Date().toISOString(),
    };
    setWasteItems(prev => [newItem, ...prev]);
  }

  function buyItem(id: string) {
    setWasteItems(prev =>
      prev.map(i => (i.id === id ? { ...i, status: "sold" as const, buyerName: userName || "Anonymous Farmer" } : i))
    );
  }

  function confirmPickup(id: string) {
    setWasteItems(prev =>
      prev.map(i => (i.id === id ? { ...i, status: "picked_up" as const } : i))
    );
  }

  return (
    <AppContext.Provider value={{
      role, userName, wasteItems,
      totalWasteDiverted, totalCO2Saved, totalFarmersSupported, totalTransactions,
      setRole, setUserName, addWasteItem, buyItem, confirmPickup, classifyWaste,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
