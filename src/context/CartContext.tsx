"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Product } from "@/types";

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    total: number;
    discount: number;
    finalTotal: number;
}

type CartAction =
    | { type: "ADD_ITEM"; payload: Product & { selectedSize?: string } }
    | { type: "REMOVE_ITEM"; payload: { id: string; selectedSize?: string } }
    | { type: "UPDATE_QUANTITY"; payload: { id: string; selectedSize?: string; quantity: number } }
    | { type: "TOGGLE_CART" }
    | { type: "CLEAR_CART" }
    | { type: "SET_CART"; payload: CartItem[] }
    | { type: "UPDATE_TOTALS"; payload: { total: number; discount: number; finalTotal: number } };

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case "ADD_ITEM": {
            // Check ID AND Size
            const existingItem = state.items.find((item) =>
                item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
            );
            let newItems;
            if (existingItem) {
                newItems = state.items.map((item) =>
                    (item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                newItems = [...state.items, { ...action.payload, quantity: 1 }];
            }
            return {
                ...state,
                items: newItems,
                isOpen: true,
            };
        }
        case "REMOVE_ITEM": {
            const newItems = state.items.filter((item) =>
                !(item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
            );
            return {
                ...state,
                items: newItems,
            };
        }
        case "UPDATE_QUANTITY": {
            const newItems = state.items.map((item) =>
                (item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
                    ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                    : item
            );
            return {
                ...state,
                items: newItems,
            };
        }
        case "TOGGLE_CART":
            return { ...state, isOpen: !state.isOpen };
        case "CLEAR_CART":
            return { ...state, items: [], total: 0, discount: 0, finalTotal: 0 };
        case "SET_CART":
            return {
                ...state,
                items: action.payload,
            };
        case "UPDATE_TOTALS":
            return {
                ...state,
                total: action.payload.total,
                discount: action.payload.discount,
                finalTotal: action.payload.finalTotal
            };
        default:
            return state;
    }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        isOpen: false,
        total: 0,
        discount: 0,
        finalTotal: 0
    });

    const calculateTotals = (items: CartItem[]) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        // Check for user in localStorage directly to apply discount
        const user = typeof window !== 'undefined' ? localStorage.getItem("aybicak-user") : null;
        const discountRate = user ? 0.05 : 0;
        const discountAmount = total * discountRate;

        return {
            total,
            discount: discountAmount,
            finalTotal: total - discountAmount
        };
    };

    // Effect to recalculate totals when items change or user logs in
    useEffect(() => {
        const totals = calculateTotals(state.items);
        dispatch({ type: "UPDATE_TOTALS", payload: totals });
    }, [state.items]);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = () => {
            const totals = calculateTotals(state.items);
            dispatch({ type: "UPDATE_TOTALS", payload: totals });
        };

        window.addEventListener("storage", handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener("aybicak-auth-change", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("aybicak-auth-change", handleStorageChange);
        }
    }, [state.items]);

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem("aybicak_cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                dispatch({ type: "SET_CART", payload: parsed });
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("aybicak_cart", JSON.stringify(state.items));
    }, [state.items]);

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
