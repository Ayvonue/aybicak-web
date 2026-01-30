"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
    // Temel Bilgiler
    name: string;
    surname: string;
    email: string;
    phone: string;

    // Detaylı Bilgiler
    birthDate?: string;
    gender?: "male" | "female" | "other";

    // Adres
    address?: string;
    city?: string;
    district?: string;

    // Sistem
    registeredAt: string;
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("aybicak-user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("aybicak-user", JSON.stringify(userData));
        // Trigger generic storage event for other tabs/components
        window.dispatchEvent(new Event("aybicak-auth-change"));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("aybicak-user");
        window.dispatchEvent(new Event("aybicak-auth-change"));
    };

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("aybicak-user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("aybicak-auth-change"));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
