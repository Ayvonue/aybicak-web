"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

interface FavoritesState {
    items: string[]; // Array of product IDs
}

type FavoritesAction =
    | { type: "ADD_FAVORITE"; payload: string }
    | { type: "REMOVE_FAVORITE"; payload: string }
    | { type: "TOGGLE_FAVORITE"; payload: string }
    | { type: "LOAD_FAVORITES"; payload: string[] };

const FavoritesContext = createContext<{
    state: FavoritesState;
    dispatch: React.Dispatch<FavoritesAction>;
    isFavorite: (id: string) => boolean;
} | null>(null);

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
    switch (action.type) {
        case "ADD_FAVORITE":
            if (state.items.includes(action.payload)) return state;
            return { ...state, items: [...state.items, action.payload] };
        case "REMOVE_FAVORITE":
            return { ...state, items: state.items.filter((id) => id !== action.payload) };
        case "TOGGLE_FAVORITE":
            if (state.items.includes(action.payload)) {
                return { ...state, items: state.items.filter((id) => id !== action.payload) };
            }
            return { ...state, items: [...state.items, action.payload] };
        case "LOAD_FAVORITES":
            return { ...state, items: action.payload };
        default:
            return state;
    }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(favoritesReducer, { items: [] });

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("aybicak-favorites");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                dispatch({ type: "LOAD_FAVORITES", payload: parsed });
            } catch (e) {
                console.error("Failed to parse favorites:", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("aybicak-favorites", JSON.stringify(state.items));
    }, [state.items]);

    const isFavorite = (id: string) => state.items.includes(id);

    return (
        <FavoritesContext.Provider value={{ state, dispatch, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within FavoritesProvider");
    }
    return context;
}
