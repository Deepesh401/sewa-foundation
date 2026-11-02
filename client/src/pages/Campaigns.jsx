import { useEffect, useState } from "react";
import { getCampaigns } from "../services/api";
import CampaignCard from "../components/CampaignCard";
import "./Campaigns.css";

const CATEGORIES = ["All", "Elders", "Children", "Animals", "Heritage", "Healthcare", "Food", "Community", "Other"];

const sampleCampaigns = [];

export default function Campaigns() {
    const [all, setAll]                       = useState([]);
    const [filtered, setFiltered]             = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading]               = useState(true);
    const [search, setSearch]                 = useState("");

    useEffect(() => {
        const load = () => {
            setLoading(true);

            getCampaigns()
                .then((d) => {
                    const api = d?.campaigns || [];
                    if (api.length > 0) {
                        // Always use fresh API data — sync localStorage so other pages are current too
                        try {
                            localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(api));
                        } catch (_) {}
                        setAll(api);
                        setFiltered(api);
                    } else {
                        // API empty — fall back to localStorage
                        let local = [];
                        try { local = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]"); } catch (_) {}
                        const final = local.length > 0 ? local : sampleCampaigns;
                        setAll(final);
                        setFiltered(final);
                    }
                })
                .catch(() => {
                    let local = [];
                    try { local = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]"); } catch (_) {}
                    const final = local.length > 0 ? local : sampleCampaigns;
                    setAll(final);
                    setFiltered(final);
                })
                .finally(() => setLoading(false));
        };

        load();

        // Re-read when user comes back to this tab (e.g. after adding a campaign in admin)
        const handleVisibility = () => {
            if (document.visibilityState === "visible") load();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        // Also listen for localStorage changes from other tabs
        const handleStorage = (e) => {
            if (e.key === "sewaam_custom_campaigns") load();
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const applyFilters = (cat, q, source) => {
        let result = source || all;
        if (cat !== "All") result = result.filter((c) => c.category === cat);
        if (q.trim()) result = result.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
        setFiltered(result);
    };

    const handleCategory = (cat) => {
        setActiveCategory(cat);
        applyFilters(cat, search, all);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        applyFilters(activeCategory, e.target.value, all);
    };

    return (
        <div className="cp-page">

            {/* ── Hero banner ── */}
            <div className="cp-hero">
                <div className="cp-hero-inner">
                    <p className="cp-hero-eyebrow">SEWAAM FOUNDATION</p>
                    <h1 className="cp-hero-title">Our Campaigns</h1>
                    <p className="cp-hero-sub">Support the causes that matter most to you.</p>
                </div>
            </div>

            <div className="cp-content">

                {/* ── Filter bar + Search ── */}
                <div className="cp-toolbar">
                    <div className="cp-cats">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                className={`cp-cat-btn${activeCategory === cat ? " active" : ""}`}
                                onClick={() => handleCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="cp-search-wrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="search"
                            placeholder="Search campaigns…"
                            value={search}
                            onChange={handleSearch}
                            className="cp-search"
                            aria-label="Search campaigns"
                        />
                    </div>
                </div>

                {/* ── Count ── */}
                {!loading && (
                    <p className="cp-count">
                        Showing <strong>{filtered.length}</strong> campaign{filtered.length !== 1 ? "s" : ""}
                        {activeCategory !== "All" && ` in ${activeCategory}`}
                    </p>
                )}

                {/* ── Loading skeletons ── */}
                {loading && (
                    <div className="cp-grid">
                        {[1,2,3,4,5,6].map((n) => (
                            <div key={n} className="cp-skeleton">
                                <div className="cp-skeleton-img" />
                                <div className="cp-skeleton-body">
                                    <div className="cp-skeleton-line" style={{ width: "85%" }} />
                                    <div className="cp-skeleton-line" style={{ width: "60%" }} />
                                    <div className="cp-skeleton-line" style={{ width: "40%" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && filtered.length === 0 && (
                    <div className="cp-empty">
                        <div className="cp-empty-icon">🔍</div>
                        <h3>No campaigns found</h3>
                        <p>Try a different category or search term.</p>
                        <button className="cp-reset-btn" onClick={() => { setActiveCategory("All"); setSearch(""); setFiltered(all); }}>
                            Show all campaigns
                        </button>
                    </div>
                )}

                {/* ── Cards grid ── */}
                {!loading && filtered.length > 0 && (
                    <div className="cp-grid">
                        {filtered.map((c) => (
                            <CampaignCard key={c._id || c.id} campaign={c} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
