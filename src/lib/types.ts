export type UserRole = "restaurant" | "farmer" | "admin";

export interface WasteItem {
    id: string;
    restaurantId: string;
    restaurantName: string;
    foodType: string;
    description?: string;
    category: "vegetable" | "grain" | "mixed" | "meat" | "dairy" | "bread";
    weightKg: number;
    safetyScore: number;
    suitableFor: string;
    price: number;
    distance: string;
    imageUrl: string;
    status: "listed" | "sold" | "picked_up";
    createdAt: string;
    buyerId?: string;
    buyerName?: string;
}

export interface Transaction {
    id: string;
    listingId: string;
    farmerId: string;
    restaurantId: string;
    weight: number;
    co2Saved: number;
    status: "pending" | "completed";
    createdAt: string;
    completedAt?: string;
}
