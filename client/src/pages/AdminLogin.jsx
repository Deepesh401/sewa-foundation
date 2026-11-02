import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const ADMIN_EMAIL   = import.meta.env.VITE_ADMIN_EMAIL   || "deepeshanjana61@gmail.com";
const ADMIN_PASS    = import.meta.env.VITE_ADMIN_PASS    || "sewaam@2026";
const ADMIN_EMAIL_2 = import.meta.env.VITE_ADMIN_EMAIL_2 || "";
const ADMIN_PASS_2  = import.meta.env.VITE_ADMIN_PASS_2  || "";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm]     = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [error, setError]   = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!form.email.trim())    return setError("Please enter your email address.");
        if (!form.password.trim()) return setError("Please enter your password.");

        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));

        const enteredEmail = form.email.trim().toLowerCase();
        const enteredPass  = form.password.trim();

        const isAdmin1 = enteredEmail === ADMIN_EMAIL.toLowerCase() && enteredPass === ADMIN_PASS;
        const isAdmin2 = ADMIN_EMAIL_2 && enteredEmail === ADMIN_EMAIL_2.toLowerCase() && enteredPass === ADMIN_PASS_2;

        const emailKnown =
            enteredEmail === ADMIN_EMAIL.toLowerCase() ||
            (ADMIN_EMAIL_2 && enteredEmail === ADMIN_EMAIL_2.toLowerCase());

        if (isAdmin1 || isAdmin2) {
            sessionStorage.setItem("admin_auth", "true");
            sessionStorage.setItem("admin_email", enteredEmail);
            navigate("/admin/dashboard", { replace: true });
        } else if (!emailKnown) {
            setError("No admin account found with this email address.");
        } else {
            setError("Incorrect password. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="login-card">

                <div className="login-logo-wrap">
                    <img
                        src="/images/sewaam-logo.png"
                        alt="Sewaam Foundation"
                        className="login-brand-logo"
                        onError={(e) => { e.target.src = "/images/sewaam-logo.svg"; }}
                    />
                </div>

                <h1 className="login-title">Admin Sign In</h1>
                <p className="login-subtitle">Enter your admin email and password to continue</p>

                <form onSubmit={handleSubmit} className="login-form" noValidate>

                    <div className="form-group-item">
                        <label className="field-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="login-input"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="admin@sewaam.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group-item">
                        <label className="field-label" htmlFor="password">Password</label>
                        <div className="login-pass-wrap">
                            <input
                                id="password"
                                name="password"
                                type={showPass ? "text" : "password"}
                                className="login-input"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="login-pass-toggle"
                                onClick={() => setShowPass(!showPass)}
                                aria-label={showPass ? "Hide password" : "Show password"}
                            >
                                {showPass ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error-box">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing In…" : "Sign In →"}
                    </button>

                </form>

                <Link to="/" className="back-website-link">
                    ← Back to Sewaam Foundation
                </Link>

            </div>
        </div>
    );
}
