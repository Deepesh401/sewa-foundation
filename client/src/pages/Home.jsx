import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampaignCard from "../components/CampaignCard";
import { getCampaigns, getDonationItems, createOrder, verifyPayment, getRecentDonations, getHeroSlides } from "../services/api";
import "./Home.css";

// ── Hero Slider Component ────────────────────────────────────────────
function HeroSlider() {
    const [slides, setSlides]     = useState([]);
    const [current, setCurrent]   = useState(0);
    const [loaded, setLoaded]     = useState(false);
    const timerRef                = useRef(null);

    useEffect(() => {
        getHeroSlides()
            .then((d) => {
                if (d?.slides?.length > 0) setSlides(d.slides);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % slides.length);
    }, [slides.length]);

    const prev = useCallback(() => {
        setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }, [slides.length]);

    // Auto-advance every 4 s
    useEffect(() => {
        if (slides.length < 2) return;
        timerRef.current = setInterval(next, 4000);
        return () => clearInterval(timerRef.current);
    }, [slides.length, next]);

    const pause = () => clearInterval(timerRef.current);
    const resume = () => {
        if (slides.length >= 2) timerRef.current = setInterval(next, 4000);
    };

    // Nothing to show yet or no slides configured
    if (!loaded || slides.length === 0) return null;

    const slide = slides[current];

    return (
        <section
            className="hero-slider-wrap"
            onMouseEnter={pause}
            onMouseLeave={resume}
        >
            <div className="hero-slider-card">
                {/* Background image */}
                <div
                    className="hero-slider-bg"
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
                {/* Dark gradient overlay */}
                <div className="hero-slider-overlay" />

                {/* Content */}
                <div className="hero-slider-content">
                    <h1 className="hero-slider-title">{slide.title}</h1>
                    {slide.subtitle && (
                        <p className="hero-slider-subtitle">{slide.subtitle}</p>
                    )}
                    <div className="hero-slider-actions">
                        <Link
                            to={slide.buttonLink || "/donate"}
                            className="hero-slider-btn hero-slider-btn--primary"
                        >
                            {slide.buttonLabel || "Donate Now"} →
                        </Link>
                    </div>
                </div>

                {/* Slide counter */}
                <div className="hero-slider-counter">
                    <span className="hero-counter-current">
                        {String(current + 1).padStart(2, "0")}
                    </span>
                    <span className="hero-counter-sep">/</span>
                    <span className="hero-counter-total">
                        {String(slides.length).padStart(2, "0")}
                    </span>
                </div>


            </div>

            {/* Dot navigation */}
            {slides.length > 1 && (
                <div className="hero-slider-dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={`hero-dot${i === current ? " active" : ""}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// Sample campaigns — only used as fallback if no campaigns exist in DB or localStorage
const sampleCampaigns = [];

// Fallback essential needs — used only when API is unavailable
const fallbackNeeds = [
    { id: "atta-10kg",       title: "10 Kg Aata",       subtitle: "Provide food for a family.",          price: 501,  image: "/images/atta-10kg.png" },
    { id: "atta-50kg",       title: "50 Kg Aata",        subtitle: "Support a community kitchen.",        price: 2500, image: "/images/atta-50kg.png" },
    { id: "first-aid-kit",   title: "First Aid Kit",     subtitle: "Essential care for emergency support.", price: 501, image: "/images/first-aid-kit.png" },
    { id: "medical-care-kit",title: "Medical Care Kit",  subtitle: "Support basic healthcare needs.",     price: 1000, image: "/images/medical-care-kit.png" },
];

// ── Contributors Marquee Component ──────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function DonorCard({ donor }) {
    const initial = (donor.donorName || "?").charAt(0).toUpperCase();
    const colors  = ["#e60023","#f5a623","#6b4fa0","#0ea5e9","#22c55e","#f43f5e","#8b5cf6"];
    const color   = colors[initial.charCodeAt(0) % colors.length];
    return (
        <div className="contrib-card">
            <div className="contrib-avatar" style={{ background: color }}>
                {initial}
            </div>
            <div className="contrib-info">
                <p className="contrib-name">{donor.donorName}</p>
                <p className="contrib-amount">Donated ₹{Number(donor.amount).toLocaleString("en-IN")}</p>
                <p className="contrib-cause">
                    {donor.createdAt ? timeAgo(donor.createdAt) : donor.campaignName}
                </p>
            </div>
        </div>
    );
}

function ContributorsMarquee() {
    const [donors, setDonors] = useState([]);

    useEffect(() => {
        getRecentDonations()
            .then((d) => { if (d?.donations?.length > 0) setDonors(d.donations); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handle = (e) => {
            if (e.detail) setDonors((prev) => [{
                donorName:    e.detail.name,
                amount:       e.detail.amount,
                campaignName: e.detail.campaign,
                createdAt:    new Date().toISOString(),
            }, ...prev].slice(0, 30));
        };
        window.addEventListener("sewaam_donation_made", handle);
        return () => window.removeEventListener("sewaam_donation_made", handle);
    }, []);

    if (donors.length === 0) return null;

    // Only repeat for seamless CSS scroll animation — not to fake more donors
    const half = Math.ceil(donors.length / 2);
    const row1 = donors.slice(0, half);
    const row2 = donors.slice(half);

    // Single row if fewer than 4 real donors
    const singleRow = donors.length < 4;

    return (
        <section className="contrib-section">
            <div className="contrib-header">
                <h2 className="contrib-title">Respected Contributors</h2>
                <p className="contrib-subtitle">Every donation creates a ripple of hope 🙏</p>
            </div>

            <div className="contrib-track-wrap">
                {/* Row 1 — scrolls left, always shown */}
                <div className="contrib-track contrib-track--left">
                    {[...row1, ...row1, ...row1, ...row1].map((d, i) => <DonorCard key={i} donor={d} />)}
                </div>
                {/* Row 2 — only show if enough unique donors */}
                {!singleRow && (
                    <div className="contrib-track contrib-track--right">
                        {[...row2, ...row2, ...row2, ...row2].map((d, i) => <DonorCard key={i} donor={d} />)}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const [campaignList, setCampaignList] = useState(sampleCampaigns);
    const [essentialNeeds, setEssentialNeeds] = useState(fallbackNeeds);
    const [quantities, setQuantities] = useState({});

    // Cart state
    const [cart, setCart] = useState([]); // [{item, qty}]
    const [cartCustom, setCartCustom] = useState("");
    const [cartPaying, setCartPaying] = useState(false);
    const [cartError, setCartError] = useState("");
    const CART_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000];
    const cartRef = useRef(null);

    useEffect(() => {
        const loadCampaigns = () => {
            // Fetch fresh from API (MongoDB) — always use latest data including raisedAmount/donorsCount
            getCampaigns()
                .then((data) => {
                    const apiCampaigns = data?.campaigns || [];
                    if (apiCampaigns.length > 0) {
                        setCampaignList(apiCampaigns);
                        // Keep localStorage in sync with latest DB data
                        try {
                            localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(apiCampaigns));
                        } catch (_) {}
                    } else {
                        // API returned empty — fall back to localStorage
                        let local = [];
                        try { local = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]"); } catch (_) {}
                        setCampaignList(local.length > 0 ? local : sampleCampaigns);
                    }
                })
                .catch(() => {
                    // API failed — use localStorage as fallback
                    let local = [];
                    try { local = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]"); } catch (_) {}
                    setCampaignList(local.length > 0 ? local : sampleCampaigns);
                });
        };

        loadCampaigns();

        // Re-load when user comes back to this tab
        const handleVisibility = () => {
            if (document.visibilityState === "visible") loadCampaigns();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        const handleStorage = (e) => {
            if (e.key === "sewaam_custom_campaigns") loadCampaigns();
        };
        window.addEventListener("storage", handleStorage);

        // ── Load essential needs from API; fall back to hardcoded if unavailable ──
        getDonationItems()
            .then((data) => {
                if (data?.items?.length > 0) {
                    // Map backend fields → display shape used by the cards
                    const mapped = data.items.map((item) => ({
                        id:       item._id,
                        title:    item.name,
                        subtitle: item.description,
                        price:    item.price,
                        image:    item.image || "/images/atta-10kg.png",
                    }));
                    setEssentialNeeds(mapped);
                }
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    const updateQuantity = (id, delta) => {
        setQuantities((prev) => {
            const current = prev[id] || 0;
            const updated = Math.max(0, Math.min(99, current + delta));
            return { ...prev, [id]: updated };
        });
    };

    // Add to cart
    const handleAddNeedToDonate = (item) => {
        const qty = quantities[item.id] || 0;
        if (qty === 0) return;
        setCart((prev) => {
            const exists = prev.find((c) => c.item.id === item.id);
            if (exists) {
                return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + qty } : c);
            }
            return [...prev, { item, qty }];
        });
        // Scroll to cart on mobile
        if (window.innerWidth < 900 && cartRef.current) {
            cartRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Update qty inside cart
    const updateCartQty = (itemId, delta) => {
        setCart((prev) => prev
            .map((c) => c.item.id === itemId ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
            .filter((c) => c.qty > 0)
        );
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    };

    const itemsTotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
    const customAmtNum = Math.max(0, Number(cartCustom) || 0);
    const grandTotal = itemsTotal + customAmtNum;

    // Razorpay payment from cart
    const handleCartPay = async () => {
        setCartError("");
        if (grandTotal < 1) return setCartError("Add items or enter an amount to proceed.");
        if (!window.Razorpay) return setCartError("Payment gateway not loaded. Check your connection.");

        setCartPaying(true);
        try {
            const itemDesc = cart.map((c) => `${c.item.title} x${c.qty}`).join(", ") || "Custom Donation";
            const details = {
                amount: grandTotal,          // server multiplies by 100
                donorName: "Donor",
                email: "donor@sewaam.org",
                phone: "9000000000",
                campaignId: "essential-needs",
                message: itemDesc,
                isAnonymous: false,
            };
            const orderRes = await createOrder(details);
            const resp = orderRes?.data ?? orderRes;
            if (!resp?.order?.id) throw new Error(resp?.message || "Could not create order.");

            const rp = new window.Razorpay({
                key: resp.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: resp.order.amount,
                currency: resp.order.currency || "INR",
                name: "Sewaam Foundation",
                description: itemDesc,
                order_id: resp.order.id,
                theme: { color: "#f5a623" },
                handler: async (rzpResp) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: rzpResp.razorpay_order_id,
                            razorpay_payment_id: rzpResp.razorpay_payment_id,
                            razorpay_signature: rzpResp.razorpay_signature,
                        });
                        window.location.assign("/donation-success");
                    } catch { setCartError("Verification failed. Contact support."); }
                    finally { setCartPaying(false); }
                },
                modal: { ondismiss: () => setCartPaying(false) },
            });
            rp.on("payment.failed", (r) => {
                setCartError(r?.error?.description || "Payment failed.");
                setCartPaying(false);
            });
            rp.open();
        } catch (err) {
            setCartError(err?.response?.data?.message || err?.message || "Could not start payment.");
            setCartPaying(false);
        }
    };
    return (
        <div className="home-container">
            {/* ── 1. HERO SLIDER ── */}
            <HeroSlider />

            {/* ── 2. FLOATING IMPACT STATISTICS BAR ─────────────────── */}
            <section className="floating-stats-wrapper">
                <div className="floating-stats-card">
                    {/* Stat 1: Meals */}
                    <div className="floating-stat-item">
                        <div className="floating-stat-icon-box">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 2v8a3 3 0 0 1-3 3h-2" />
                                <path d="M15 2v8" />
                                <path d="M12 2v8" />
                                <path d="M6 2v10a3 3 0 0 0 3 3h1" />
                                <path d="M10 22V12" />
                            </svg>
                        </div>
                        <div className="floating-stat-info">
                            <div className="floating-stat-number">15K+</div>
                            <div className="floating-stat-label">Meals Served</div>
                        </div>
                    </div>

                    <div className="floating-stat-divider" />

                    {/* Stat 2: Animals */}
                    <div className="floating-stat-item">
                        <div className="floating-stat-icon-box">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="4" r="2" />
                                <circle cx="18" cy="8" r="2" />
                                <circle cx="20" cy="16" r="2" />
                                <path d="M9 10a5 5 0 0 1 5 5v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a5 5 0 0 1 5-5z" />
                                <circle cx="4" cy="8" r="2" />
                            </svg>
                        </div>
                        <div className="floating-stat-info">
                            <div className="floating-stat-number">500+</div>
                            <div className="floating-stat-label">Animals Rescued</div>
                        </div>
                    </div>

                    <div className="floating-stat-divider" />

                    {/* Stat 3: Children */}
                    <div className="floating-stat-item">
                        <div className="floating-stat-icon-box">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                        <div className="floating-stat-info">
                            <div className="floating-stat-number">200+</div>
                            <div className="floating-stat-label">Children Educated</div>
                        </div>
                    </div>

                    <div className="floating-stat-divider" />

                    {/* Stat 4: Communities */}
                    <div className="floating-stat-item">
                        <div className="floating-stat-icon-box">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="floating-stat-info">
                            <div className="floating-stat-number">50+</div>
                            <div className="floating-stat-label">Communities Reached</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. FEATURED CAMPAIGNS & GENERAL DONATION ───────────── */}
            <section className="section-featured-wrap" id="campaigns">
                <div className="section-container">

                    {/* ── Section intro header ── */}
                    <div className="section-intro-block">
                        <span className="section-badge">CAUSES WE SUPPORT</span>
                        <h2 className="section-intro-heading">Support a Cause That Matters to You</h2>
                        <p className="section-intro-sub">
                            From education and healthcare to food, shelter, and community welfare — your support brings hope to those who need it most.
                        </p>
                    </div>

                    <div className="section-title-bar">
                        <div className="heading-with-line">
                            <h2 className="section-main-heading">Featured Campaigns</h2>
                            <div className="heading-red-accent" />
                        </div>

                        <Link to="/campaigns" className="view-all-link">
                            View All Campaigns <span className="arrow-icon">→</span>
                        </Link>
                    </div>

                    <div className="featured-cards-grid">
                        {campaignList.map((campaign) => (
                            <CampaignCard
                                key={campaign._id || campaign.id || campaign.title}
                                campaign={campaign}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. SUPPORT & ESSENTIAL NEEDS ──────────────────────── */}
            <section className="section-needs-wrap" id="needs">
                <div className="section-container">
                    <div className="needs-header-row">
                        <div className="heading-with-line">
                            <h2 className="section-main-heading">Support &amp; Essential Needs</h2>
                            <div className="heading-red-accent" />
                        </div>
                        <p className="needs-subtitle">
                            Contribute to specific needs and make an immediate impact.
                        </p>
                    </div>

                    {/* Two-col: items grid + cart panel */}
                    <div className="needs-cart-layout">

                        {/* ── LEFT: items grid ── */}
                        <div className="needs-products-grid">
                            {essentialNeeds.map((item) => {
                                const qty = quantities[item.id] || 0;
                                return (
                                    <div className="need-product-card" key={item.id}>
                                        <div className="need-img-box">
                                            <img src={item.image} alt={item.title} />
                                        </div>
                                        <div className="need-info-box">
                                            <h4 className="need-item-title">{item.title}</h4>
                                            <p className="need-item-subtitle">{item.subtitle}</p>
                                            <div className="need-item-price">
                                                ₹{item.price.toLocaleString("en-IN")}
                                                <span className="need-item-unit"> / {item.unit || "item"}</span>
                                            </div>
                                            <div className="need-qty-selector">
                                                <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease">−</button>
                                                <span className="need-qty-value">{qty}</span>
                                                <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase">+</button>
                                            </div>
                                            <button
                                                type="button"
                                                className="need-add-btn"
                                                onClick={() => handleAddNeedToDonate(item)}
                                                disabled={qty === 0}
                                            >
                                                <span className="heart-icon">♡</span> Add to Donate
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── RIGHT: cart panel ── */}
                        <div className="cart-panel" ref={cartRef}>
                            <div className="cart-panel-header">
                                <span className="cart-panel-icon">🛒</span>
                                <div>
                                    <div className="cart-panel-title">Your Donation</div>
                                    <div className="cart-panel-sub">Review your items and proceed to secure payment.</div>
                                </div>
                            </div>

                            {/* Cart items */}
                            <div className="cart-items-list">
                                {cart.length === 0 ? (
                                    <p className="cart-empty">No items added yet. Select quantity and click "Add to Donate".</p>
                                ) : cart.map(({ item, qty }) => (
                                    <div className="cart-item-row" key={item.id}>
                                        <img src={item.image} alt={item.title} className="cart-item-img" />
                                        <div className="cart-item-info">
                                            <div className="cart-item-name">{item.title}</div>
                                            <div className="cart-item-qty-ctrl">
                                                <button type="button" onClick={() => updateCartQty(item.id, -1)}>−</button>
                                                <span>{qty}</span>
                                                <button type="button" onClick={() => updateCartQty(item.id, 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="cart-item-right">
                                            <div className="cart-item-price">₹{(item.price * qty).toLocaleString("en-IN")}</div>
                                            <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove">🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Custom amount */}
                            <div className="cart-custom-section">
                                <div className="cart-custom-label">Add a custom amount (optional)</div>
                                <div className="cart-custom-input-wrap">
                                    <span>₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Enter amount"
                                        value={cartCustom}
                                        onChange={(e) => setCartCustom(e.target.value)}
                                        className="cart-custom-input"
                                    />
                                </div>
                                <div className="cart-preset-grid">
                                    {CART_PRESETS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`cart-preset-btn${cartCustom === String(p) ? " active" : ""}`}
                                            onClick={() => setCartCustom(String(p))}
                                        >
                                            ₹ {p.toLocaleString("en-IN")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="cart-totals">
                                <div className="cart-total-row">
                                    <span>Items total</span>
                                    <span>₹{itemsTotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="cart-total-row">
                                    <span>Custom amount</span>
                                    <span>₹{customAmtNum.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="cart-total-row cart-grand-total">
                                    <span>Total</span>
                                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {cartError && <div className="cart-error">{cartError}</div>}

                            {/* Pay button */}
                            <button
                                type="button"
                                className="cart-pay-btn"
                                onClick={handleCartPay}
                                disabled={cartPaying || grandTotal < 1}
                            >
                                {cartPaying ? "Processing…" : `⚡ Proceed to Pay with Razorpay →`}
                            </button>

                            <div className="cart-trust-row">
                                <span>🔒 Secure Payment via Razorpay</span>
                                <span>🛡 100% Safe &amp; Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. RESPECTED CONTRIBUTORS ─────────────────────────── */}
            <ContributorsMarquee />
        </div>
    );
}
