"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WasteItem, UserRole } from "@/lib/types";

interface AppContextType {
  role: UserRole | null;
  userName: string;
  wasteItems: WasteItem[];
  totalWasteDiverted: number;
  totalCO2Saved: number;
  totalFarmersSupported: number;
  totalTransactions: number;
  wasteByMonth: { month: string; year: number; waste: number; co2: number }[];
  wasteByCategory: { name: string; value: number }[];
  listingStats: { active: number; sold: number; completed: number };
  topRestaurants: { name: string; waste: number; co2: number; rating: number }[];
  setRole: (role: UserRole | null) => void;
  setUserName: (name: string) => void;
  addWasteItem: (item: Omit<WasteItem, "id" | "status" | "createdAt" | "restaurantId">) => Promise<void>;
  buyItem: (id: string) => Promise<void>;
  confirmPickup: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Persist auth state
  useEffect(() => {
    const storedRole = localStorage.getItem("app_role") as UserRole | null;
    const storedName = localStorage.getItem("app_userName");
    if (storedRole) setRole(storedRole);
    if (storedName) setUserName(storedName);
  }, []);

  const setRole = (r: UserRole | null) => {
    _setRole(r);
    if (r) localStorage.setItem("app_role", r);
    else localStorage.removeItem("app_role");
  };

  const setUserName = (n: string) => {
    _setUserName(n);
    if (n) localStorage.setItem("app_userName", n);
    else localStorage.removeItem("app_userName");
  };

  const [role, _setRole] = useState<UserRole | null>(null);
  const [userName, _setUserName] = useState("");
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);

  // Real-time listener for waste listings
  useEffect(() => {
    const q = query(collection(db, "waste_listings"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WasteItem[];
      setWasteItems(items);
    });
    return () => unsubscribe();
  }, []);

  // Calculate stats dynamically
  const soldOrPickedUp = wasteItems.filter((i) => i.status === "sold" || i.status === "picked_up");

  const totalWasteDiverted = soldOrPickedUp.reduce((s, i) => s + Number(i.weightKg || 0), 0);
  const totalCO2Saved = totalWasteDiverted * 2.5;

  // Count unique buyers (farmers)
  const uniqueFarmers = new Set(soldOrPickedUp.map(i => i.buyerName).filter(Boolean));
  const totalFarmersSupported = uniqueFarmers.size;

  const totalTransactions = wasteItems.filter((i) => i.status === "picked_up").length;

  // --- New Aggregations for Dashboard ---

  // 1. Waste by Month (Last 7 months)
  const wasteByMonth = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    // Initialize last 7 months
    const stats = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return {
        month: months[d.getMonth()],
        year: d.getFullYear(),
        waste: 0,
        co2: 0,
      };
    });

    soldOrPickedUp.forEach(item => {
      const date = new Date(item.createdAt);
      const monthIdx = date.getMonth();
      const year = date.getFullYear();

      const stat = stats.find(s => s.month === months[monthIdx] && s.year === year);
      if (stat) {
        stat.waste += Number(item.weightKg || 0);
        stat.co2 += Number(item.weightKg || 0) * 2.5;
      }
    });

    return stats;
  })();

  // 2. Waste by Category
  const wasteByCategory = (() => {
    const categories: Record<string, number> = {};
    let total = 0;
    soldOrPickedUp.forEach(item => {
      const weight = Number(item.weightKg || 0);
      categories[item.category] = (categories[item.category] || 0) + weight;
      total += weight;
    });

    return Object.entries(categories)
      .map(([name, weight]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: total > 0 ? Math.round((weight / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  })();

  // 3. Listing Status
  const listingStats = {
    active: wasteItems.filter(i => i.status === "listed").length,
    sold: wasteItems.filter(i => i.status === "sold").length,
    completed: wasteItems.filter(i => i.status === "picked_up").length,
  };

  // 4. Top Restaurants
  const topRestaurants = (() => {
    const restStats: Record<string, { name: string, waste: number, co2: number, rating: number }> = {};

    soldOrPickedUp.forEach(item => {
      if (!restStats[item.restaurantName]) {
        restStats[item.restaurantName] = {
          name: item.restaurantName,
          waste: 0,
          co2: 0,
          rating: 4.0 + Math.random() // Mock rating for now as it's not in DB
        };
      }
      restStats[item.restaurantName].waste += Number(item.weightKg || 0);
      restStats[item.restaurantName].co2 += Number(item.weightKg || 0) * 2.5;
    });

    return Object.values(restStats)
      .sort((a, b) => b.waste - a.waste)
      .slice(0, 5);
  })();


  const addWasteItem = async (item: Omit<WasteItem, "id" | "status" | "createdAt" | "restaurantId">) => {
    await addDoc(collection(db, "waste_listings"), {
      ...item,
      restaurantId: userName || "demo_restaurant", // Ideally from auth
      restaurantName: userName || "Demo Restaurant", // Store name denormalized
      status: "listed",
      createdAt: new Date().toISOString(), // Using string for consistency with previous type, but serverTimestamp is better
    });
  };

  const buyItem = async (id: string) => {
    const itemRef = doc(db, "waste_listings", id);
    await updateDoc(itemRef, {
      status: "sold",
      buyerName: userName || "Anonymous Farmer",
      buyerId: userName || "farmer_id",
    });

    // Create a transaction record
    const item = wasteItems.find(i => i.id === id);
    if (item) {
      await addDoc(collection(db, "transactions"), {
        listingId: id,
        farmerName: userName || "Anonymous Farmer",
        restaurantName: item.restaurantName,
        weight: item.weightKg,
        co2Saved: item.weightKg * 2.5,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
  };

  const confirmPickup = async (id: string) => {
    const itemRef = doc(db, "waste_listings", id);
    await updateDoc(itemRef, {
      status: "picked_up",
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        userName,
        wasteItems,
        totalWasteDiverted,
        totalCO2Saved,
        totalFarmersSupported,
        totalTransactions,
        wasteByMonth,
        wasteByCategory,
        listingStats,
        topRestaurants,
        setRole,
        setUserName,
        addWasteItem,
        buyItem,
        confirmPickup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
