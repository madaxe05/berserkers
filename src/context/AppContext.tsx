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
import { classifyWasteLogic } from "@/lib/utils";

interface AppContextType {
  role: UserRole | null;
  userName: string;
  wasteItems: WasteItem[];
  totalWasteDiverted: number;
  totalCO2Saved: number;
  totalFarmersSupported: number;
  totalTransactions: number;
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

  const addWasteItem = async (item: Omit<WasteItem, "id" | "status" | "createdAt" | "restaurantId">) => {
    await addDoc(collection(db, "waste_listings"), {
      ...item,
      restaurantId: userName || "demo_restaurant", // Ideally from auth
      status: "listed",
      createdAt: new Date().toISOString(), // Using string for consistency with previous type, but serverTimestamp is better
    });
  };

  const buyItem = async (id: string) => {
    const itemRef = doc(db, "waste_listings", id);
    await updateDoc(itemRef, {
      status: "sold",
      buyerName: userName || "Anonymous Farmer",
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
