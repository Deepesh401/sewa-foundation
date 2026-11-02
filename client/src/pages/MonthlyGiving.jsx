import { useState, useEffect } from "react";
import { getCampaigns, createOrder, verifyPayment } from "../services/api";
import "./MonthlyGiving.css";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

const sampleCampaigns = [
    { _id: "elders-shelter",   title: "Meals for Elders & Hungry Families" },
    { _id: "animal-rescue",    title: "Rescue & Care for Stray Animals" },
    { _id: "child-education",  title: "Support Child Education" },
    { _id: "community-dev",    title: "Strengthen Communities" },
];

const pillars = [
    { icon: "🍲", label: "Feed the\nHungry" },
    { icon: "🐾", label: "Rescue &\nCare for Animals" },
    { icon: "🎓", label: "Support\nChild Education" },
    { icon: "🤝", label: "Strengthen\nCommunities" },
];

const steps = [
    { num: "01", icon: "🎯", title: "Choose A Cause",       desc: "Select the campaign closest to your heart." },
    { num: "02", icon: "💳", title: "Select An Amount",      desc: "Pick a quick amount or enter your own." },
    { num: "03", icon: "🔄", title: "Approve The Mandate",   desc: "Authorise your secure monthly payment once." },
    { num: "04", icon: "❤️", title: "See Your Impact",       desc: "Stay connected through campaign updates." },
];

const benefits = [
    { title: "Consistent Support",    desc: "Help a campaign continue its work month after month." },
    { title: "Simple And Secure",     desc: "Approve one Razorpay mandate for automatic monthly giving." },
    { title: "Transparent Updates",   desc: "Stay connected with the cause and the impact you support." },
    { title: "Your Choice",           desc: "Choose the campaign and monthly amount that work for you." },
];

export default function MonthlyGiving() {
    const [campaigns, setCampaigns]           = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [dropdownOpen, setDropdownOpen]     = useState(false);
    const [amount, setAmount]                 = useState(1000);
    const [customAmount, setCustomAmount]     = useState("");
    const [form, setForm]                     = useState({ name: "", email: "", phone: "" });
    const [authorized, setAuthorized]         = useState(false);
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState("");

    useEffect(() => {
        getCampaigns()
            .then((d) => {
                const list = d?.campaigns || [];
                const final = list.length > 0 ? list : sampleCampaigns;
                setCampaigns(final);
                setSelectedCampaign(final[0]);
            })
            .catch(() => {
                setCampaigns(sampleCampaigns);
                setSelectedCampaign(sampleCampaigns[0]);
            });
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest(".mg-dropdown-wrap")) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const finalAmount = customAmount ? parseInt(customAmount) || 0 : amount;

    const handleAmountSelect = (val) => {
        setAmount(val);
        setCustomAmount("");
    };

    const handleCustomChange = (e) => {
        const val = e.target.value.replace(/\D/g, "");
        setCustomAmount(val);
        setAmount(0);
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!selectedCampaign)                              return setError("Please select a campaign.");
        if (!finalAmount || finalAmount < 10)               return setError("Minimum donation amount is ₹10.");
        if (!form.name.trim())                              return setError("Please enter your full name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email.");
        if (!/^[6-9]\d{9}$/.test(form.phone))              return setError("Please enter a valid 10-digit mobile number.");
        if (!authorized)                                    return setError("Please authorise the monthly mandate.");
        if (!window.Razorpay)                               return setError("Payment gateway not loaded. Please refresh.");

        setLoading(true);
        try {
            const orderRes = await createOrder({
                amount: finalAmount,
                campaignId: selectedCampaign._id,
                donorName: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                isMonthly: true,
            });

            const resp = orderRes?.data ?? orderRes;
            if (!resp?.order?.id) throw new Error(resp?.message || "Could not create order.");

            const rp = new window.Razorpay({
                key: resp.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: resp.order.amount,
                currency: resp.order.currency || "INR",
                name: "Sewaam Foundation",
                description: `Monthly: ${selectedCampaign.title}`,
                order_id: resp.order.id,
                prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.trim() },
                theme: { color: "#f5a623" },
                handler: async (rzpResp) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: rzpResp.razorpay_order_id,
                            razorpay_payment_id: rzpResp.razorpay_payment_id,
                            razorpay_signature: rzpResp.razorpay_signature,
                        });
                        window.location.assign("/donation-success");
                    } catch {
                        setError("Payment verified but confirmation failed. Contact support.");
                    } finally { setLoading(false); }
                },
                modal: { ondismiss: () => setLoading(false) },
            });
            rp.on("payment.failed", (r) => {
                setError(r?.error?.description || "Payment failed. Please try again.");
                setLoading(false);
            });
            rp.open();
        } catch (err) {
            setError(err?.message || "Could not start payment.");
            setLoading(false);
        }
    };

    return (
        <div className="mg-page">

            {/* ══ HERO + FORM ══ */}
            <section className="mg-hero-section">

                {/* ── LEFT ── */}
                <div className="mg-hero-left">
                    <div className="mg-hero-eyebrow" />

                    <h1 className="mg-hero-title">
                        Make a Monthly<br />Contribution.
                        <span className="mg-hero-title--highlight">Create a<br />Lasting Change.</span>
                    </h1>

                    <p className="mg-hero-sub">
                        Your regular support helps feed families, care for animals, and bring education and hope to communities in need.
                    </p>

                    {/* Pillars */}
                    <div className="mg-pillars">
                        {pillars.map((p) => (
                            <div key={p.label} className="mg-pillar">
                                <div className="mg-pillar-icon">{p.icon}</div>
                                <span style={{ whiteSpace: "pre-line" }}>{p.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA pill */}
                    <div className="mg-hero-cta-pill">
                        <span>✨</span>
                        A Small Monthly Contribution Can Change a Life.
                        <span>✨</span>
                    </div>
                </div>

                {/* ── RIGHT: Form Card ── */}
                <div className="mg-form-card">
                    <h2 className="mg-form-card-title">Become a Monthly Giver</h2>
                    <p className="mg-form-card-sub">Choose a cause and make a lasting difference, one month at a time.</p>

                    <form onSubmit={handleSubmit} className="mg-form" noValidate>

                        {/* Campaign selector */}
                        <div className="mg-field">
                            <label className="mg-label">Choose a Monthly Campaign <span className="mg-required">*</span></label>
                            <div className="mg-dropdown-wrap">
                                <button
                                    type="button"
                                    className="mg-dropdown-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <span>{selectedCampaign?.title || "Select a campaign…"}</span>
                                    <svg className={`mg-dropdown-icon ${dropdownOpen ? "open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                {dropdownOpen && (
                                    <ul className="mg-dropdown-list">
                                        {campaigns.map((c) => (
                                            <li
                                                key={c._id}
                                                className={`mg-dropdown-item ${selectedCampaign?._id === c._id ? "active" : ""}`}
                                                onClick={() => { setSelectedCampaign(c); setDropdownOpen(false); }}
                                            >
                                                <span>{c.title}</span>
                                                {selectedCampaign?._id === c._id && <span className="mg-check">✓</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="mg-field">
                            <label className="mg-label">Choose Your Monthly Amount</label>
                            <p className="mg-amount-hint">Select an amount or enter your own. Minimum ₹10.</p>
                            <div className="mg-amount-grid">
                                {PRESET_AMOUNTS.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`mg-amount-btn ${amount === val && !customAmount ? "active" : ""}`}
                                        onClick={() => handleAmountSelect(val)}
                                    >
                                        {val === 1000 && <span className="mg-most-impactful">MOST IMPACTFUL</span>}
                                        ₹{val.toLocaleString("en-IN")}
                                    </button>
                                ))}
                            </div>
                            <div className="mg-custom-wrap">
                                <span className="mg-rupee">₹</span>
                                <input
                                    type="text"
                                    className="mg-custom-input"
                                    placeholder="Enter custom amount"
                                    value={customAmount}
                                    onChange={handleCustomChange}
                                />
                            </div>
                        </div>

                        {/* Name + Email */}
                        <div className="mg-row">
                            <div className="mg-field">
                                <label className="mg-label">Full Name <span className="mg-required">*</span></label>
                                <input type="text" name="name" className="mg-input" placeholder="Enter full name" value={form.name} onChange={handleFormChange} />
                            </div>
                            <div className="mg-field">
                                <label className="mg-label">Email ID <span className="mg-required">*</span></label>
                                <input type="email" name="email" className="mg-input" placeholder="Enter email address" value={form.email} onChange={handleFormChange} />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="mg-field">
                            <label className="mg-label">Mobile Number <span className="mg-required">*</span></label>
                            <input type="tel" name="phone" className="mg-input" placeholder="Enter 10 digit mobile number" maxLength={10} value={form.phone} onChange={handleFormChange} />
                        </div>

                        {/* Authorise */}
                        <label className="mg-authorize">
                            <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mg-checkbox" />
                            <span>I Authorise The Selected Amount As A Recurring Monthly Mandate Until Cancellation.</span>
                        </label>

                        {error && <p className="mg-error">{error}</p>}

                        <button type="submit" className="mg-submit-btn" disabled={loading}>
                            {loading ? "Processing…" : `Donate ₹${(finalAmount || 0).toLocaleString("en-IN")} Monthly`}
                            {!loading && <span>→</span>}
                        </button>

                        <p className="mg-secure-note">🔒 Secure monthly payment powered by Razorpay</p>
                    </form>
                </div>
            </section>

            {/* ══ HOW IT WORKS ══ */}
            <section className="mg-how-section">
                <div className="mg-container">
                    <p className="mg-eyebrow">SIMPLE MONTHLY GIVING</p>
                    <h2 className="mg-how-title">How Monthly Giving Works</h2>
                    <div className="mg-steps-grid">
                        {steps.map((s) => (
                            <div key={s.num} className="mg-step-card">
                                <div className="mg-step-top">
                                    <div className="mg-step-icon">{s.icon}</div>
                                    <span className="mg-step-num">{s.num}</span>
                                </div>
                                <h3 className="mg-step-title">{s.title}</h3>
                                <p className="mg-step-desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ WHY GIVE MONTHLY ══ */}
            <section className="mg-why-section">
                <div className="mg-why-grid">
                    {/* Left: image */}
                    <div className="mg-why-img-wrap">
                        <img
                            src="/images/donate-hero.jpg"
                            alt="Sewaam Foundation helping communities"
                            className="mg-why-img"
                            onError={(e) => { e.target.src = "/images/campaign-elderly.jpg"; }}
                        />
                        <div className="mg-why-img-badge">
                            <p className="mg-img-badge-title">Every Month</p>
                            <p className="mg-img-badge-sub">Steady support. Real impact.</p>
                        </div>
                    </div>

                    {/* Right: content */}
                    <div className="mg-why-content">
                        <p className="mg-why-eyebrow">WHY GIVE MONTHLY?</p>
                        <h2 className="mg-why-title">
                            A Simple Way To Create
                            <span className="mg-why-title--highlight">Lasting Change</span>
                        </h2>
                        <p className="mg-why-sub">
                            Your recurring support helps verified causes plan care and respond consistently.
                        </p>
                        <div className="mg-benefits-grid">
                            {benefits.map((b) => (
                                <div key={b.title} className="mg-benefit-item">
                                    <div className="mg-benefit-icon">✓</div>
                                    <div>
                                        <h4 className="mg-benefit-title">{b.title}</h4>
                                        <p className="mg-benefit-desc">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className="mg-start-btn"
                        >
                            Start Monthly Giving &nbsp;→
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
