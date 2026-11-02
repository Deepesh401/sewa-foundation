import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Heart,
    UserRound,
    Mail,
    Phone,
    MapPin,
    Coins,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import { createOrder, verifyPayment } from "../services/api";
import "./Donate.css";

const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

export default function Donate() {
    const [searchParams] = useSearchParams();

    const [amount, setAmount] = useState(() => {
        const value = Number(searchParams.get("amount"));
        return Number.isFinite(value) && value > 0 ? value : 2500;
    });
    const [amountInput, setAmountInput] = useState(() => {
        const value = Number(searchParams.get("amount"));
        return String(Number.isFinite(value) && value > 0 ? value : 2500);
    });
    const debounceRef = useRef(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const donationAmount = Math.max(0, Number(amount) || 0);

    useEffect(() => {
        document.title = "Donate | Sewaam Foundation";
    }, []);

    const handleAmountChange = (event) => {
        const raw = event.target.value;
        setAmountInput(raw);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const parsed = Math.max(0, Number(raw) || 0);
            setAmount(raw === "" ? 0 : parsed);
        }, 400);
    };

    const handleAmountBlur = () => {
        clearTimeout(debounceRef.current);
        const parsed = Math.max(0, Number(amountInput) || 0);
        setAmount(parsed);
        setAmountInput(parsed === 0 ? "" : String(parsed));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!/^[6-9]\d{9}$/.test(phone.trim())) {
            setError("Please enter a valid 10-digit Indian mobile number.");
            return;
        }
        if (!city.trim()) {
            setError("Please enter your city or location.");
            return;
        }
        if (!Number.isFinite(Number(amount)) || Number(amount) < 1) {
            setError("Please enter a donation amount of at least ₹1.");
            return;
        }
        if (!window.Razorpay) {
            setError("The payment gateway is not loaded. Please check your internet connection.");
            return;
        }

        setLoading(true);

        try {
            const donationDetails = {
                amount: Math.round(donationAmount * 100),
                donationAmount: Math.round(donationAmount),
                fullName: anonymous ? "Anonymous Donor" : fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                city: city.trim(),
                anonymous,
                whatsAppUpdates,
                item: searchParams.get("item") || "General Donation",
                qty: Number(searchParams.get("qty")) || 1,
            };

            const orderResponse = await createOrder(donationDetails);
            const order = orderResponse?.data ?? orderResponse;

            if (!order?.id) {
                throw new Error(order?.message || "Unable to create the payment order.");
            }

            const razorpay = new window.Razorpay({
                key: order.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount || donationDetails.amount,
                currency: order.currency || "INR",
                name: "Sewaam Foundation",
                description: "Donation to support people, animals and communities",
                order_id: order.id,
                prefill: {
                    name: fullName.trim(),
                    email: email.trim(),
                    contact: phone.trim(),
                },
                theme: { color: "#ef4050" },
                handler: async (paymentResponse) => {
                    try {
                        await verifyPayment({
                            ...paymentResponse,
                            orderId: order.id,
                            donationDetails,
                        });
                        window.location.assign("/donation-success");
                    } catch (verificationError) {
                        console.error("Payment verification failed:", verificationError);
                        setError(
                            "Payment verification could not be completed. Please contact support before trying again."
                        );
                    } finally {
                        setLoading(false);
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            });

            razorpay.on("payment.failed", (response) => {
                setError(response?.error?.description || "Payment failed. Please try again.");
                setLoading(false);
            });

            razorpay.open();
        } catch (paymentError) {
            console.error("Donation error:", paymentError);
            setError(
                paymentError?.response?.data?.message ||
                paymentError?.message ||
                "Unable to start the donation. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <main className="donate-page">
            <div className="donate-layout">

                {/* ── Left: hero image panel ── */}
                <section className="donate-poster-panel" aria-label="Sewaam Foundation hero">
                    <img
                        src="/images/hero-banner.jpg"
                        alt="A volunteer sitting with an elderly woman and a dog — Sewaam Foundation"
                        className="donate-poster-img"
                    />
                    <div className="donate-poster-overlay" aria-hidden="true" />
                    <div className="donate-poster-text">
                        <p className="donate-poster-brand">SEWAAM FOUNDATION</p>
                        <h2 className="donate-poster-heading">
                            Kindness<br />
                            <span>Feeds Lives</span>
                        </h2>
                        <p className="donate-poster-sub">
                            Helping people, animals and communities with your contribution.
                        </p>
                    </div>
                </section>

                {/* ── Right: form ── */}
                <section className="donate-form-panel">

                    <div className="donate-eyebrow">
                        <Heart size={15} fill="currentColor" />
                        Donate Once
                    </div>

                    <h1 className="donate-title">
                        Be the Reason for a <span className="donate-title-accent">Better Tomorrow</span>
                    </h1>

                    <p className="donate-desc">
                        Your support helps us provide food, care, medical aid and opportunities
                        for people, animals and communities in need.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* amount input */}
                        <label className="donate-amount-box" htmlFor="d-amount">
                            <span className="donate-currency">
                                <span className="donate-currency-symbol">₹</span> INR
                            </span>
                            <span className="donate-amount-divider" aria-hidden="true" />
                            <input
                                id="d-amount"
                                type="number"
                                min="1"
                                step="1"
                                value={amountInput}
                                onChange={handleAmountChange}
                                onBlur={handleAmountBlur}
                                required
                                aria-label="Donation amount in rupees"
                            />
                        </label>

                        {/* breakdown — donation amount only */}
                        <div className="donate-breakdown">
                            <div className="donate-bd-total">
                                <Coins size={18} className="donate-bd-icon donate-bd-icon--red" aria-hidden="true" />
                                <span>Donation Amount</span>
                                <span className="donate-bd-total-value">{formatINR(donationAmount)}</span>
                            </div>
                        </div>

                        {/* full name */}
                        <div className="donate-field">
                            <label htmlFor="d-name" className="donate-field-label">
                                Full Name <span className="donate-required">*</span>
                            </label>
                            <div className="donate-input-wrap">
                                <UserRound size={17} className="donate-input-icon" aria-hidden="true" />
                                <input
                                    id="d-name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        {/* email + phone */}
                        <div className="donate-two-col">
                            <div className="donate-field">
                                <label htmlFor="d-email" className="donate-field-label">
                                    Email ID <span className="donate-required">*</span>
                                </label>
                                <div className="donate-input-wrap">
                                    <Mail size={17} className="donate-input-icon" aria-hidden="true" />
                                    <input
                                        id="d-email"
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="donate-field">
                                <label htmlFor="d-phone" className="donate-field-label">
                                    Phone Number <span className="donate-required">*</span>
                                </label>
                                <div className="donate-input-wrap">
                                    <Phone size={17} className="donate-input-icon" aria-hidden="true" />
                                    <input
                                        id="d-phone"
                                        type="tel"
                                        placeholder="10-digit mobile"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                        }
                                        autoComplete="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* city */}
                        <div className="donate-field">
                            <label htmlFor="d-city" className="donate-field-label">
                                City / Location
                            </label>
                            <div className="donate-input-wrap">
                                <MapPin size={17} className="donate-input-icon" aria-hidden="true" />
                                <input
                                    id="d-city"
                                    type="text"
                                    placeholder="Enter your city or location"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    autoComplete="address-level2"
                                />
                            </div>
                        </div>

                        {/* checkboxes */}
                        <div className="donate-checks">
                            <label className="donate-check">
                                <input
                                    type="checkbox"
                                    checked={anonymous}
                                    onChange={(e) => setAnonymous(e.target.checked)}
                                />
                                <span>Make my donation anonymous</span>
                            </label>

                            <label className="donate-check">
                                <input
                                    type="checkbox"
                                    checked={whatsAppUpdates}
                                    onChange={(e) => setWhatsAppUpdates(e.target.checked)}
                                />
                                <span>I want to receive transaction and donation updates on WhatsApp</span>
                            </label>
                        </div>

                        {/* terms */}
                        <p className="donate-terms">
                            By continuing, you are agreeing to our{" "}
                            <a href="/terms">Terms of Use</a> and{" "}
                            <a href="/privacy-policy">Privacy Policy</a>.
                        </p>

                        {/* error */}
                        {error && (
                            <div className="donate-error" role="alert">
                                {error}
                            </div>
                        )}

                        {/* submit */}
                        <button type="submit" className="donate-submit" disabled={loading}>
                            {loading ? "Processing…" : `Donate ${formatINR(donationAmount)}`}
                            {!loading && <ArrowRight size={20} aria-hidden="true" />}
                        </button>

                        <p className="donate-secure">
                            <ShieldCheck size={13} aria-hidden="true" />
                            Secure payment · Every contribution makes a difference
                        </p>
                    </form>
                </section>
            </div>
        </main>
    );
}
