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
import { WasteItem, UserRole, Review } from "@/lib/types";

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
  topRestaurants: { name: string; waste: number; co2: number; rating: number; count: number }[];
  reviews: Review[];
  setRole: (role: UserRole | null) => void;
  setUserName: (name: string) => void;
  addWasteItem: (item: Omit<WasteItem, "id" | "status" | "createdAt" | "restaurantId">) => Promise<void>;
  buyItem: (id: string, paymentMethod?: "cod" | "online") => Promise<void>;
  confirmPickup: (id: string) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "createdAt">) => Promise<void>;
  getRestaurantRating: (restaurantName: string) => number;
  getRestaurantTransactionCount: (restaurantName: string) => number;
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
  const [reviews, setReviews] = useState<Review[]>([]);

  // Real-time listener for reviews
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      setReviews(items);
    });
    return () => unsubscribe();
  }, []);

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
  // Use ALL waste items for "Potential" impact visibility, or allow toggling. 
  // For now, based on user feedback, they want to see "their data", so we use all items.
  const relevantItems = wasteItems; // Previously filtered for soldOrPickedUp

  const totalWasteDiverted = relevantItems.reduce((s, i) => s + Number(i.weightKg || 0), 0);
  const totalCO2Saved = totalWasteDiverted * 2.5;

  // Count unique buyers (farmers) - this strictly needs sold/picked up though, or it's 0
  const soldOrPickedUp = wasteItems.filter((i) => i.status === "sold" || i.status === "picked_up");
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

    relevantItems.forEach(item => {
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
    wasteItems.forEach(item => {
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

  // 4. Top Restaurants (Calculated from actual reviews)
  const topRestaurants = (() => {
    const restStats: Record<string, { name: string, waste: number, co2: number, ratingSum: number, reviewCount: number }> = {};

    // Initialize with waste data
    wasteItems.forEach(item => {
      if (!restStats[item.restaurantName]) {
        restStats[item.restaurantName] = {
          name: item.restaurantName,
          waste: 0,
          co2: 0,
          ratingSum: 0,
          reviewCount: 0
        };
      }
      restStats[item.restaurantName].waste += Number(item.weightKg || 0);
      restStats[item.restaurantName].co2 += Number(item.weightKg || 0) * 2.5;
    });

    // Add review data
    reviews.forEach(review => {
      // If restaurant exists from waste data, update it. If not, we could add it, but for "Top Restaurants" usually means top impact + quality.
      // For now, let's only consider restaurants that have activity in sold/picked_up or we can initialize them here too.
      // Let's initialize if missing to be safe, though they should be in waste items if they are being reviewed.
      if (!restStats[review.restaurantId]) { // Note: review uses restaurantId (which is name for now)
        restStats[review.restaurantId] = {
          name: review.restaurantId,
          waste: 0,
          co2: 0,
          ratingSum: 0,
          reviewCount: 0
        };
      }
      restStats[review.restaurantId].ratingSum += review.rating;
      restStats[review.restaurantId].reviewCount += 1;
    });

    return Object.values(restStats)
      .map(stat => ({
        name: stat.name,
        waste: stat.waste,
        co2: stat.co2,
        rating: stat.reviewCount > 0 ? stat.ratingSum / stat.reviewCount : 0,
        count: stat.reviewCount
      }))
      .sort((a, b) => {
        // Rated restaurants first, then sort by rating (desc), waste as tiebreaker
        if (a.rating > 0 && b.rating === 0) return -1;
        if (a.rating === 0 && b.rating > 0) return 1;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.waste - a.waste;
      })
      .slice(0, 5);
  })();

  const getRestaurantRating = (restaurantName: string) => {
    const restaurantReviews = reviews.filter(r => r.restaurantId === restaurantName);
    if (restaurantReviews.length === 0) return 0;
    const sum = restaurantReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / restaurantReviews.length;
  };


  const addWasteItem = async (item: Omit<WasteItem, "id" | "status" | "createdAt" | "restaurantId">) => {
    await addDoc(collection(db, "waste_listings"), {
      ...item,
      restaurantId: userName || "demo_restaurant", // Ideally from auth
      restaurantName: userName || "Demo Restaurant", // Store name denormalized
      status: "listed",
      createdAt: new Date().toISOString(), // Using string for consistency with previous type, but serverTimestamp is better
    });
  };

  const getRestaurantTransactionCount = (restaurantName: string) => {
    return wasteItems.filter(i => i.restaurantName === restaurantName && (i.status === "sold" || i.status === "picked_up")).length;
  };

  const buyItem = async (id: string, paymentMethod: "cod" | "online" = "cod") => {
    const itemRef = doc(db, "waste_listings", id);
    await updateDoc(itemRef, {
      status: "sold",
      buyerName: userName || "Anonymous Farmer",
      buyerId: userName || "farmer_id",
      paymentMethod,
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

  const addReview = async (review: Omit<Review, "id" | "createdAt">) => {
    await addDoc(collection(db, "reviews"), {
      ...review,
      createdAt: new Date().toISOString()
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
        reviews,
        setRole,
        setUserName,
        addWasteItem,
        buyItem,
        confirmPickup,
        addReview,
        getRestaurantRating,
        getRestaurantTransactionCount,
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
