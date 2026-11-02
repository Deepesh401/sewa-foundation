import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCampaignById, createOrder, verifyPayment } from "../services/api";
import "./CampaignDetails.css";

function fmt(amount) {
    if (!amount || isNaN(amount)) return "₹0";
    const n = Number(amount);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (n >= 1000)     return `₹${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${n.toLocaleString("en-IN")}`;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

// Sample products - in production these would come from the campaign data
const SAMPLE_PRODUCTS = [
    { id: 1, name: "Medicine Kit",     price: 900,  donated: 26,  goal: 1500, image: "/images/medical-care-kit.png" },
    { id: 2, name: "Food Kit",         price: 900,  donated: 14,  goal: 1800, image: "/images/atta-50kg.png" },
    { id: 3, name: "Rice 10KG",        price: 500,  donated: 59,  goal: 700,  image: "/images/atta-10kg.png" },
    { id: 4, name: "Milk Tetra Pack",  price: 600,  donated: 17,  goal: 1500, image: "/images/atta-10kg.png" },
    { id: 5, name: "Chappi Dog Food",  price: 750,  donated: 15,  goal: 1000, image: "/images/atta-50kg.png" },
    { id: 6, name: "First Aid Kit",    price: 800,  donated: 10,  goal: 500,  image: "/images/first-aid-kit.png" },
];

export default function CampaignDetails() {
    const { id } = useParams();

    const [campaign, setCampaign]       = useState(null);
    const [loading, setLoading]         = useState(true);
    const [imgIndex, setImgIndex]       = useState(0);
    const [activeTab, setActiveTab]     = useState("Products");

    // Donation widget state
    const [amount, setAmount]           = useState(1000);
    const [amountInput, setAmountInput] = useState("1000");
    const [fullName, setFullName]       = useState("");
    const [email, setEmail]             = useState("");
    const [phone, setPhone]             = useState("");
    const [paying, setPaying]           = useState(false);
    const [payError, setPayError]       = useState("");
    const debounce = useRef(null);

    // Cart state
    const [cart, setCart] = useState([]);

    // Sync cart total → donation amount whenever cart changes
    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (total > 0) {
            setAmount(total);
            setAmountInput(String(total));
        } else {
            setAmount(1000);
            setAmountInput("1000");
        }
    }, [cart]);

    // Load campaign — check localStorage first for admin-created ones
    // Load campaign — always fetch fresh from MongoDB, localStorage only as fallback
    useEffect(() => {
        setLoading(true);

        getCampaignById(id)
            .then((data) => {
                if (data?.campaign) {
                    setCampaign(data.campaign);
                    setLoading(false);
                    return;
                }
                throw new Error("Not found in DB");
            })
            .catch(() => {
                // Fallback to localStorage for campaigns not yet in MongoDB
                try {
                    const local = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
                    const found = local.find((c) => c._id === id || c.slug === id) || null;
                    if (found) setCampaign(found);
                } catch (_) {}
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="cd-page">
                <div className="cd-spinner" aria-label="Loading…" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="cd-page">
                <div className="cd-not-found">
                    <h2>Campaign not found</h2>
                    <Link to="/campaigns" className="cd-back-link">← Back to Campaigns</Link>
                </div>
            </div>
        );
    }

    const images = Array.isArray(campaign.gallery) && campaign.gallery.length > 0
        ? campaign.gallery
        : campaign.image ? [campaign.image] : [];

    const target  = Number(campaign.targetAmount) || 0;
    const raised  = Number(campaign.raisedAmount)  || 0;
    const donors  = campaign.donorsCount || (raised > 0 ? Math.max(1, Math.round(raised / 1250)) : 0);
    const pct     = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

    // Use products from campaign if available, otherwise use sample products
    const products = campaign.products && campaign.products.length > 0 
        ? campaign.products 
        : SAMPLE_PRODUCTS;

    // Cart functions
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    // Amount input handlers (debounced)
    const handleAmtChange = (e) => {
        const raw = e.target.value;
        setAmountInput(raw);
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => {
            setAmount(Math.max(1, Number(raw) || 1));
        }, 350);
    };
    const handleAmtBlur = () => {
        clearTimeout(debounce.current);
        const parsed = Math.max(1, Number(amountInput) || 1);
        setAmount(parsed);
        setAmountInput(String(parsed));
    };

    // Pay via Razorpay (for direct donations)
    const handlePay = async (e) => {
        e.preventDefault();
        setPayError("");

        if (!fullName.trim())                             return setPayError("Please enter your name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  return setPayError("Enter a valid email.");
        if (!/^[6-9]\d{9}$/.test(phone))                 return setPayError("Enter a valid 10-digit mobile number.");
        if (!window.Razorpay)                             return setPayError("Payment gateway not loaded. Check your connection.");

        setPaying(true);
        try {
            // Only send campaignId if it's a real MongoDB ObjectId (24 hex chars)
            const isValidObjectId = /^[a-f\d]{24}$/i.test(campaign._id || id);

            const details = {
                amount: amount,
                donorName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                campaignId: isValidObjectId ? (campaign._id || id) : undefined,
                message: cart.length > 0
                    ? `${campaign.title} - ${cart.map(item => `${item.name} x${item.quantity}`).join(", ")}`
                    : campaign.title,
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
                description: campaign.title,
                order_id: resp.order.id,
                prefill: { name: fullName.trim(), email: email.trim(), contact: phone.trim() },
                theme: { color: "#f5a623" },
                handler: async (rzpResp) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: rzpResp.razorpay_order_id,
                            razorpay_payment_id: rzpResp.razorpay_payment_id,
                            razorpay_signature: rzpResp.razorpay_signature,
                        });
                        setCart([]);

                        // Fire donation toast on all open pages
                        const toastData = {
                            name: fullName.trim(),
                            amount: amount,
                            campaign: campaign.title,
                        };
                        try {
                            localStorage.setItem("sewaam_last_donation", JSON.stringify(toastData));
                            // Also fire on THIS tab via custom event (storage event doesn't fire on same tab)
                            window.dispatchEvent(new CustomEvent("sewaam_donation_made", { detail: toastData }));
                        } catch (_) {}

                        window.location.assign("/donation-success");
                    } catch {
                        setPayError("Payment verified but confirmation failed. Contact support.");
                    } finally { setPaying(false); }
                },
                modal: { ondismiss: () => setPaying(false) },
            });
            rp.on("payment.failed", (r) => {
                setPayError(r?.error?.description || "Payment failed. Please try again.");
                setPaying(false);
            });
            rp.open();
        } catch (err) {
            setPayError(err?.response?.data?.message || err?.message || "Could not start payment.");
            setPaying(false);
        }
    };

    // Cart checkout via Razorpay
    const handleCartCheckout = async () => {
        setPayError("");

        if (!fullName.trim())                             return setPayError("Please enter your name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  return setPayError("Enter a valid email.");
        if (!/^[6-9]\d{9}$/.test(phone))                 return setPayError("Enter a valid 10-digit mobile number.");
        if (cart.length === 0)                           return setPayError("Your cart is empty.");
        if (!window.Razorpay)                             return setPayError("Payment gateway not loaded. Check your connection.");

        setPaying(true);
        try {
            const isValidObjectId = /^[a-f\d]{24}$/i.test(campaign._id || id);
            const cartTotal = getCartTotal();

            const details = {
                amount: cartTotal,
                donorName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                campaignId: isValidObjectId ? (campaign._id || id) : undefined,
                message: `${campaign.title} - Products: ${cart.map(item => `${item.name} x${item.quantity}`).join(", ")}`,
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
                description: `${campaign.title} - Products`,
                order_id: resp.order.id,
                prefill: { name: fullName.trim(), email: email.trim(), contact: phone.trim() },
                theme: { color: "#f5a623" },
                handler: async (rzpResp) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: rzpResp.razorpay_order_id,
                            razorpay_payment_id: rzpResp.razorpay_payment_id,
                            razorpay_signature: rzpResp.razorpay_signature,
                        });
                        setCart([]);

                        // Fire donation toast
                        const toastData = {
                            name: fullName.trim(),
                            amount: getCartTotal(),
                            campaign: campaign.title,
                        };
                        try {
                            localStorage.setItem("sewaam_last_donation", JSON.stringify(toastData));
                            window.dispatchEvent(new CustomEvent("sewaam_donation_made", { detail: toastData }));
                        } catch (_) {}

                        window.location.assign("/donation-success");
                    } catch {
                        setPayError("Payment verified but confirmation failed. Contact support.");
                    } finally { setPaying(false); }
                },
                modal: { ondismiss: () => setPaying(false) },
            });
            rp.on("payment.failed", (r) => {
                setPayError(r?.error?.description || "Payment failed. Please try again.");
                setPaying(false);
            });
            rp.open();
        } catch (err) {
            setPayError(err?.response?.data?.message || err?.message || "Could not start payment.");
            setPaying(false);
        }
    };

    return (
        <div className="cd-page">
            <div className="cd-container">

                {/* Breadcrumb */}
                <nav className="cd-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/campaigns">Campaigns</Link>
                    <span aria-hidden="true"> › </span>
                    <span>{campaign.title}</span>
                </nav>

                {/* Title */}
                <h1 className="cd-title">{campaign.title}</h1>

                {/* Main grid */}
                <div className="cd-grid">

                    {/* ── LEFT: image + tabs ── */}
                    <div className="cd-left">

                        {/* Image carousel */}
                        <div className="cd-img-wrap">
                            {images.length > 0 ? (
                                <div className="cd-slider-track" style={{ transform: `translateX(-${imgIndex * 100}%)` }}>
                                    {images.map((src, i) => (
                                        <img
                                            key={i}
                                            src={src}
                                            alt={`${campaign.title} ${i + 1}`}
                                            className="cd-slide-img"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="cd-img-placeholder">🤝</div>
                            )}

                            {/* Left arrow */}
                            {images.length > 1 && (
                                <button
                                    className="cd-arrow cd-arrow--prev"
                                    onClick={() => setImgIndex(i => (i === 0 ? images.length - 1 : i - 1))}
                                    aria-label="Previous image"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}

                            {/* Right arrow */}
                            {images.length > 1 && (
                                <button
                                    className="cd-arrow cd-arrow--next"
                                    onClick={() => setImgIndex(i => (i === images.length - 1 ? 0 : i + 1))}
                                    aria-label="Next image"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            )}

                            {/* Dot indicators */}
                            {images.length > 1 && (
                                <div className="cd-dots">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`cd-dot${i === imgIndex ? " active" : ""}`}
                                            onClick={() => setImgIndex(i)}
                                            aria-label={`Go to image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="cd-tabs">
                            {["Products", "About", "FAQs"].map((t) => (
                                <button key={t} className={`cd-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                            ))}
                        </div>

                        <div className="cd-tab-body">
                            {activeTab === "About" && (
                                <div className="cd-about">
                                    {campaign.description
                                        ? campaign.description.split("\n\n").map((p, i) => <p key={i}>{p}</p>)
                                        : <p>No description available.</p>
                                    }
                                </div>
                            )}

                            {activeTab === "Products" && (
                                <div className="cd-products">
                                    <div className="cd-products-grid">
                                        {products.map(product => {
                                            const cartItem = cart.find(c => c.id === product.id);
                                            const qty = cartItem ? cartItem.quantity : 0;
                                            const donatedPct = product.goal > 0
                                                ? Math.min(100, Math.round((product.donated / product.goal) * 100))
                                                : 0;
                                            return (
                                                <div key={product.id} className="cd-product-card">
                                                    <img src={product.image} alt={product.name} className="cd-product-img" />
                                                    <div className="cd-product-body">
                                                        <h4 className="cd-product-name">{product.name}</h4>
                                                        <div className="cd-product-progress-row">
                                                            <span className="cd-product-donated">{product.donated} / {product.goal} Donated</span>
                                                            <span className="cd-product-pct">{donatedPct}%</span>
                                                        </div>
                                                        <div className="cd-product-track">
                                                            <div className="cd-product-fill" style={{ width: `${Math.max(donatedPct, 1)}%` }} />
                                                        </div>
                                                        <div className="cd-product-footer">
                                                            <div className="cd-product-price-wrap">
                                                                <span className="cd-product-price-label">PRICE</span>
                                                                <span className="cd-product-price">₹{product.price.toLocaleString("en-IN")}</span>
                                                            </div>
                                                            <div className="cd-qty-stepper">
                                                                <button
                                                                    className="cd-qty-btn"
                                                                    onClick={() => updateQuantity(product.id, qty - 1)}
                                                                    aria-label="Decrease"
                                                                >−</button>
                                                                <span className="cd-qty-val">{qty}</span>
                                                                <button
                                                                    className="cd-qty-btn"
                                                                    onClick={() => addToCart(product)}
                                                                    aria-label="Increase"
                                                                >+</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === "Updates" && (
                                <div className="cd-updates">
                                    {Array.isArray(campaign.updates) && campaign.updates.length > 0
                                        ? campaign.updates.map((u, i) => (
                                            <div key={i} className="cd-update-item">
                                                <span className="cd-update-date">{u.date}</span>
                                                <h4>{u.title}</h4>
                                                <p>{u.text}</p>
                                            </div>
                                          ))
                                        : <p className="cd-empty">No updates yet.</p>
                                    }
                                </div>
                            )}
                            {activeTab === "FAQs" && (
                                <div className="cd-faqs">
                                    {Array.isArray(campaign.faqs) && campaign.faqs.length > 0
                                        ? campaign.faqs.map((f, i) => (
                                            <div key={i} className="cd-faq-item">
                                                <h4>{f.q}</h4>
                                                <p>{f.a}</p>
                                            </div>
                                          ))
                                        : <p className="cd-empty">No FAQs yet.</p>
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: donation widget ── */}
                    <div className="cd-right">
                        <div className="cd-widget">

                            {/* Header badges */}
                            <div className="cd-widget-badges">
                                {campaign.hasTaxBenefit && (
                                    <span className="cd-badge cd-badge--tax">🎁 Tax Benefit</span>
                                )}
                            </div>

                            {/* Raised / donors */}
                            <div className="cd-widget-stats">
                                <div>
                                    <div className="cd-widget-raised-label">RAISED SO FAR</div>
                                    <div className="cd-widget-raised-val">₹ {raised.toLocaleString("en-IN")}</div>
                                </div>
                                <div className="cd-widget-donors">
                                    <div className="cd-widget-donors-num">{donors}</div>
                                    <div className="cd-widget-donors-label">DONORS</div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="cd-widget-progress-wrap">
                                <div className="cd-widget-pct-pill">{pct}% Complete</div>
                                <div className="cd-widget-track">
                                    <div className="cd-widget-fill" style={{ width: `${Math.max(pct, 1)}%` }} />
                                </div>
                                <div className="cd-widget-goal">Goal ₹ {target.toLocaleString("en-IN")}</div>
                            </div>

                            {/* Donation form */}
                            <form onSubmit={handlePay} noValidate className="cd-widget-form">

                                {/* Cart summary (shown when products are selected) */}
                                {cart.length > 0 && (
                                    <div className="cd-widget-cart-summary">
                                        <div className="cd-widget-cart-label">
                                            🛒 Selected Items
                                        </div>
                                        {cart.map(item => (
                                            <div key={item.id} className="cd-widget-cart-row">
                                                <span className="cd-widget-cart-item-name">{item.name} × {item.quantity}</span>
                                                <span className="cd-widget-cart-item-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                            </div>
                                        ))}
                                        <div className="cd-widget-cart-total-row">
                                            <span>Total</span>
                                            <span>₹{getCartTotal().toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Amount input */}
                                <div className="cd-amt-box">
                                    <span className="cd-amt-icon">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={amountInput}
                                        onChange={handleAmtChange}
                                        onBlur={handleAmtBlur}
                                        aria-label="Donation amount"
                                        className="cd-amt-input"
                                    />
                                </div>

                                {/* Preset pills — hide when cart is active */}
                                {cart.length === 0 && (
                                    <div className="cd-presets">
                                        {PRESET_AMOUNTS.map((a) => (
                                            <button
                                                key={a}
                                                type="button"
                                                className={`cd-preset${amount === a ? " active" : ""}`}
                                                onClick={() => { setAmount(a); setAmountInput(String(a)); }}
                                            >
                                                {a.toLocaleString("en-IN")}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Name */}
                                <input
                                    type="text"
                                    placeholder="Your full name *"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="cd-field"
                                    required
                                />

                                {/* Email */}
                                <input
                                    type="email"
                                    placeholder="Email address *"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="cd-field"
                                    required
                                />

                                {/* Phone */}
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile *"
                                    value={phone}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, ""); // digits only
                                        if (val.startsWith("91") && val.length > 10) val = val.slice(2); // strip +91
                                        if (val.startsWith("0")) val = val.slice(1); // strip leading 0
                                        setPhone(val.slice(0, 10));
                                    }}
                                    inputMode="numeric"
                                    className="cd-field"
                                    required
                                />

                                {payError && <div className="cd-pay-error" role="alert">{payError}</div>}

                                {/* Submit */}
                                <button type="submit" className="cd-pay-btn" disabled={paying}>
                                    {paying
                                        ? "Processing…"
                                        : cart.length > 0
                                            ? `Donate ₹${getCartTotal().toLocaleString("en-IN")} — ${getCartCount()} item${getCartCount() > 1 ? "s" : ""}`
                                            : `₹ ${Number(amount).toLocaleString("en-IN")}  Donate Now`
                                    }
                                </button>
                            </form>

                            {/* Share row */}
                            <div className="cd-share-row">
                                <span>Share</span>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="cd-share-btn">f</a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(campaign.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className="cd-share-btn">𝕏</a>
                                <a href={`https://wa.me/?text=${encodeURIComponent(campaign.title + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="cd-share-btn">W</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
