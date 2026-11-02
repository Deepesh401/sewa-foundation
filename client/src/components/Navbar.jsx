import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

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
                {/* 1. Left: Brand Logo */}
                <Link to="/" className="site-navbar-brand" onClick={() => setMenuOpen(false)}>
                    <img 
                        src="/images/sewaam-logo.png" 
                        alt="Sewaam Foundation" 
                        className="site-navbar-logo"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/sewaam-logo.svg";
                        }}
                    />
                </Link>

                {/* 2. Center: Navigation Links */}
                <nav className={`site-nav-links ${menuOpen ? "open" : ""}`}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `site-nav-link ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/campaigns"
                        className={({ isActive }) => `site-nav-link ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Campaigns
                    </NavLink>

                    {/* Our Work with Dropdown */}
                    <Link to="/our-work" className="site-nav-link" onClick={() => setMenuOpen(false)}>
                        Our Work
                    </Link>

                    <NavLink
                        to="/monthly-giving"
                        className={({ isActive }) => `site-nav-link ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Monthly Giving
                    </NavLink>

                    <NavLink
                        to="/about"
                        className={({ isActive }) => `site-nav-link ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        About Us
                    </NavLink>


                    <NavLink
                        to="/volunteer"
                        className={({ isActive }) => `site-nav-link ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Volunteer
                    </NavLink>

                    <a href="/#contact" className="site-nav-link" onClick={() => setMenuOpen(false)}>
                        Contact
                    </a>

                    {/* Mobile Only Donate Button */}
                    <Link 
                        to="/campaigns" 
                        className="mobile-donate-btn"
                        onClick={() => setMenuOpen(false)}
                    >
                        Donate Now ♡
                    </Link>
                </nav>

                {/* 3. Right: Search & Donate Now Button */}
                <div className="site-navbar-actions">
                    {/* Search Icon / Bar */}
                    <div className="site-search-wrap">
                        {searchOpen ? (
                            <form onSubmit={handleSearchSubmit} className="site-search-form">
                                <input
                                    type="text"
                                    placeholder="Search causes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="site-search-input"
                                />
                                <button type="submit" className="site-search-submit" aria-label="Submit Search">
                                    🔍
                                </button>
                                <button
                                    type="button"
                                    className="site-search-close"
                                    onClick={() => setSearchOpen(false)}
                                    aria-label="Close search"
                                >
                                    ✕
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                className="site-search-icon-btn"
                                onClick={() => setSearchOpen(true)}
                                aria-label="Open search bar"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Red Donate Now Button with Heart */}
                    <Link to="/campaigns" className="navbar-donate-pill-btn">
                        Donate Now <span className="nav-heart-icon">♡</span>
                    </Link>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        className="mobile-hamburger-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        <span className={`bar ${menuOpen ? "open" : ""}`} />
                        <span className={`bar ${menuOpen ? "open" : ""}`} />
                        <span className={`bar ${menuOpen ? "open" : ""}`} />
                    </button>
                </div>
            </div>
        </header>
    );
}
