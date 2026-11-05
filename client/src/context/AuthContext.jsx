import { createContext, useContext, useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount — restore session from localStorage
    useEffect(() => {
        const token = localStorage.getItem("sewaam_user_token");
        if (!token) { setLoading(false); return; }

        fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { if (d.success) setUser({ ...d.user, token }); })
            .catch(() => localStorage.removeItem("sewaam_user_token"))
            .finally(() => setLoading(false));
    }, []);

    const register = async (name, email, password) => {
        const res  = await fetch(`${API}/auth/register`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        localStorage.setItem("sewaam_user_token", data.token);
        setUser({ ...data.user, token: data.token });
        return data.user;
    };

    const login = async (email, password) => {
        const res  = await fetch(`${API}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        localStorage.setItem("sewaam_user_token", data.token);
        setUser({ ...data.user, token: data.token });
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem("sewaam_user_token");
        setUser(null);
    };

    const getMyDonations = async () => {
        const token = localStorage.getItem("sewaam_user_token");
        const res   = await fetch(`${API}/auth/my-donations`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.donations;
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout, getMyDonations }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
