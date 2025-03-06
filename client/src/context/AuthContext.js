"use client"
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    const verifyToken = async () => {
        const token = localStorage.getItem("tkn");
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/get-user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem("token"); 
                setUser(null);
            }
        } catch (error) {
            console.error("Token verification failed", error);
            setUser(null);
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem("tkn", token);
        setUser(userData);
        Promise.resolve().then(() => {
            router.push("/");
        });
    };

    const logout = () => {
        localStorage.removeItem("tkn");
        setUser(null);
        Promise.resolve().then(() => {
            router.push("/login");
        });
    };

    const refreshUser = async () => {
        console.log("Refreshing user data...");
        await verifyToken();  // Fetch latest user data
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
