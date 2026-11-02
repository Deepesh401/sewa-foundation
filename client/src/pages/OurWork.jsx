import { useState, useEffect } from "react";
import "./OurWork.css";

// Helper — detect if a URL is a YouTube link and return embed URL
function getEmbedUrl(url) {
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    // Instagram reel
    if (url.includes("instagram.com")) {
        const clean = url.replace(/\/$/, "");
        return `${clean}/embed/`;
    }
    return url;
}

// Demo items shown before admin adds anything
const DEMO_ITEMS = [];

const CATEGORIES = ["All", "Animal Care", "Food Distribution", "Rescue", "Community Help", "Awareness"];

export default function OurWork() {
    const [items, setItems] = useState(DEMO_ITEMS);
    const [activeCategory, setActiveCategory] = useState("All");
    const [playing, setPlaying] = useState(null);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("sewaam_our_work") || "[]");
            if (saved.length > 0) setItems(saved);
        } catch (_) {}
    }, []);

    const filtered = activeCategory === "All"
        ? items
        : items.filter((i) => i.category === activeCategory);

    return (
        <div className="ow-page">
            <div className="ow-container">

                {/* ── Header ── */}
                <div className="ow-header">
                    <div>
                        <h1 className="ow-title">Our Work</h1>
                        <p className="ow-subtitle">
                            Real stories from the ground — see how your support helps us
                            feed, rescue, treat and care for those in need.
                        </p>
                    </div>
                    <a
                        href="https://www.instagram.com/sewaamfoundation/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ow-ig-follow-btn"
                    >
                        <span>📸</span> Follow @sewaamfoundation
                    </a>
                </div>

                {/* ── Category filter ── */}
                <div className="ow-filter-bar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`ow-filter-btn${activeCategory === cat ? " active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Cards grid ── */}
                {filtered.length === 0 ? (
                    <div className="ow-empty">
                        <p>No items in this category yet.</p>
                    </div>
                ) : (
                    <div className="ow-grid">
                        {filtered.map((item) => (
                            <div key={item.id} className="ow-card">
                                {/* Media area */}
                                <div className="ow-media">
                                    {playing === item.id && item.link ? (
                                        <iframe
                                            src={getEmbedUrl(item.link)}
                                            className="ow-embed"
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            allowFullScreen
                                            title={item.title}
                                        />
                                    ) : (
                                        <>
                                            <img
                                                src={item.thumb || item.image}
                                                alt={item.title}
                                                className="ow-thumb"
                                                onError={(e) => { e.target.src = "/images/hero-banner.jpg"; }}
                                            />
                                            <div className="ow-thumb-overlay">
                                                {item.link && (
                                                    <button
                                                        className="ow-play-btn"
                                                        onClick={() => setPlaying(item.id)}
                                                        aria-label="Play video"
                                                    >
                                                        ▶
                                                    </button>
                                                )}
                                                <span className="ow-cat-tag">{item.category}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Text */}
                                <div className="ow-card-body">
                                    <h3 className="ow-card-title">{item.title}</h3>
                                    <p className="ow-card-caption">{item.caption}</p>
                                    {item.link && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ow-watch-link"
                                        >
                                            Watch on {item.link.includes("youtube") ? "YouTube" : "Instagram"} →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Instagram banner ── */}
                <div className="ow-instagram-banner">
                    <div className="ow-ig-left">
                        <div className="ow-ig-icon">📸</div>
                        <div>
                            <div className="ow-ig-title">Follow Us on Instagram</div>
                            <div className="ow-ig-sub">Get real-time updates, reels and stories from our seva on the ground.</div>
                        </div>
                    </div>
                    <a
                        href="https://www.instagram.com/sewaamfoundation/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ow-ig-btn"
                    >
                        ↗ @sewaamfoundation
                    </a>
                </div>

            </div>
        </div>
    );
}
