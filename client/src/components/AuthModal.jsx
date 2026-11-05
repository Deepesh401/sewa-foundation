import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
    const [mode, setMode]       = useState("login"); // "login" | "signup"
    const [name, setName]       = useState("");
    const [email, setEmail]     = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);
    const { login, register }   = useAuth();
    const inputRef              = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, [mode]);

    // Close on Escape
    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "login") {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-backdrop" onMouseDown={onClose}>
            <div className="auth-modal-box" onMouseDown={(e) => e.stopPropagation()}>

                {/* Close */}
                <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>

                {/* Logo */}
                <div className="auth-modal-logo">
                    <img src="/images/sewaam-logo.png" alt="Sewaam" style={{ height: 40 }} />
                </div>

                {/* Tabs */}
                <div className="auth-modal-tabs">
                    <button
                        className={`auth-tab${mode === "login" ? " active" : ""}`}
                        onClick={() => { setMode("login"); setError(""); }}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab${mode === "signup" ? " active" : ""}`}
                        onClick={() => { setMode("signup"); setError(""); }}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-modal-form">
                    {mode === "signup" && (
                        <div className="auth-field">
                            <label>Full Name</label>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label>Email Address</label>
                        <input
                            ref={mode === "login" ? inputRef : undefined}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Please wait…" : mode === "login" ? "Login →" : "Create Account →"}
                    </button>
                </form>

                <p className="auth-switch-text">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="auth-switch-btn"
                        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                    >
                        {mode === "login" ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}
