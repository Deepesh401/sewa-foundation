import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import "./Navbar.css";

export default function Navbar() {
    const [menuOpen,     setMenuOpen]     = useState(false);
    const [aboutOpen,    setAboutOpen]    = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [searchQuery,  setSearchQuery]  = useState("");
    const [authOpen,     setAuthOpen]     = useState(false);
    const [profileOpen,  setProfileOpen]  = useState(false);
    const navigate    = useNavigate();
    const searchInput = useRef(null);
    const { user, logout } = useAuth();

    // Focus search input when it opens
    useEffect(() => {
        if (searchOpen) searchInput.current?.focus();
    }, [searchOpen]);

    // Close everything on Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== "Escape") return;
            setMenuOpen(false);
            setAboutOpen(false);
            setSearchOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const closeMobile = () => { setMenuOpen(false); setAboutOpen(false); };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/campaigns?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
            setMenuOpen(false);
        }
    };

    return (
        <header className="site-navbar-header">
            <div className="site-navbar-container">

                {/* ── Logo ─────────────────────────────────── */}
                <Link to="/" className="site-navbar-brand" onClick={closeMobile}>
                    <img
                        src="/images/sewaam-logo.png"
                        alt="Sewaam Foundation"
                        className="site-navbar-logo"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/sewaam-logo.svg"; }}
                    />
                </Link>

                {/* ── Desktop Nav ──────────────────────────── */}
                <nav className={`site-nav-links ${menuOpen ? "open" : ""}`} aria-label="Main navigation">

                    <NavLink to="/" end className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Home
                    </NavLink>

                    <NavLink to="/campaigns" className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Campaigns
                    </NavLink>

                    <NavLink to="/our-work" className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Our Work
                    </NavLink>

                    <NavLink to="/monthly-giving" className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Monthly Giving
                    </NavLink>

                    {/* About Us with dropdown */}
                    <div className="site-nav-dropdown-wrap">
                        <button
                            type="button"
                            className="site-nav-link dropdown-trigger"
                            aria-expanded={aboutOpen}
                            onClick={() => setAboutOpen((o) => !o)}
                        >
                            About Us
                            <svg
                                className={`dropdown-chevron-svg${aboutOpen ? " rotated" : ""}`}
                                width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {aboutOpen && (
                            <div className="site-nav-dropdown-menu">
                                <Link to="/about"     className="dropdown-item" onClick={closeMobile}>Our Story</Link>
                                <Link to="/our-work"  className="dropdown-item" onClick={closeMobile}>Our Work</Link>
                                <a href="/#contact"   className="dropdown-item" onClick={closeMobile}>Contact</a>
                            </div>
                        )}
                    </div>

                    <NavLink to="/volunteer" className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Volunteer
                    </NavLink>

                    <NavLink to="/contact" className={({ isActive }) => `site-nav-link${isActive ? " active" : ""}`} onClick={closeMobile}>
                        Contact
                    </NavLink>

                    {/* Mobile-only donate */}
                    <Link to="/campaigns" className="mobile-donate-btn" onClick={closeMobile}>
                        Donate Now ♥
                    </Link>
                </nav>

                {/* ── Right Actions ────────────────────────── */}
                <div className="site-navbar-actions">

                    {/* Search icon button */}
                    <button
                        type="button"
                        className="nav-icon-circle-btn"
                        aria-label="Search"
                        aria-expanded={searchOpen}
                        onClick={() => setSearchOpen((o) => !o)}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>

                    {/* User / account icon button */}
                    {user ? (
                        <div style={{ position: "relative" }}>
                            <button
                                className="nav-icon-circle-btn nav-user-avatar"
                                onClick={() => setProfileOpen(o => !o)}
                                aria-label="My account"
                                style={{ background: "#2d7a1f", color: "#fff", fontWeight: 800, fontSize: 16, border: "none" }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                            {profileOpen && (
                                <div className="nav-profile-dropdown">
                                    <div className="nav-profile-name">{user.name}</div>
                                    <div className="nav-profile-email">{user.email}</div>
                                    <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
                                    <Link to="/my-donations" className="nav-profile-item" onClick={() => setProfileOpen(false)}>
                                        💰 My Donations
                                    </Link>
                                    <button className="nav-profile-item nav-profile-logout" onClick={() => { logout(); setProfileOpen(false); }}>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="nav-icon-circle-btn"
                            aria-label="Login"
                            onClick={() => setAuthOpen(true)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </button>
                    )}

                    {/* Orange Donate Now button */}
                    <Link to="/campaigns" className="navbar-donate-pill-btn">
                        Donate Now
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
                        </svg>
                    </Link>

                    {/* Hamburger */}
                    <button
                        type="button"
                        className="mobile-hamburger-btn"
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <span className={`bar${menuOpen ? " open" : ""}`} />
                        <span className={`bar${menuOpen ? " open" : ""}`} />
                        <span className={`bar${menuOpen ? " open" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ── Search bar dropdown ───────────────────── */}
            {searchOpen && (
                <form
                    className="site-search-bar"
                    role="search"
                    onSubmit={handleSearchSubmit}
                >
                    <div className="site-search-inner">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            ref={searchInput}
                            id="site-search"
                            className="site-search-input"
                            placeholder="Search campaigns, projects and stories…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="site-search-go">Search</button>
                        <button type="button" className="site-search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
                    </div>
                </form>
            )}

            {/* ── Auth Modal ────────────────────────────── */}
            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </header>
    );
}
