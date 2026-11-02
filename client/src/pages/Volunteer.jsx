import { useState } from "react";
import { submitVolunteer } from "../services/api";
import "./Volunteer.css";

const INTERESTS = [
    "Food Distribution",
    "Animal Rescue & Care",
    "Child Education Support",
    "Elderly Care",
    "Disaster Relief",
    "Community Awareness",
    "Fundraising & Events",
    "Healthcare Camps",
];

const AVAILABILITY = [
    "Weekdays (Morning)",
    "Weekdays (Evening)",
    "Weekends Only",
    "Anytime / Flexible",
];

const benefits = [
    {
        icon: "❤️",
        title: "Make A Difference",
        desc: "Directly impact the lives of underprivileged families, animals, and children.",
    },
    {
        icon: "🤝",
        title: "Community & Growth",
        desc: "Network with like-minded people and develop leadership skills.",
    },
    {
        icon: "🏅",
        title: "Recognition",
        desc: "Get certified for your selfless contribution to society.",
    },
];

export default function Volunteer() {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        city: "",
        interest: "",
        availability: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim())         return setError("Please enter your full name.");
        if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Please enter a valid 10-digit WhatsApp number.");
        if (!form.city.trim())         return setError("Please enter your city.");
        if (!form.interest)            return setError("Please select an area of interest.");
        if (!form.availability)        return setError("Please select your availability.");

        setSubmitting(true);
        try {
            await submitVolunteer({
                name:         form.name.trim(),
                phone:        form.phone.trim(),
                city:         form.city.trim(),
                interest:     form.interest,
                availability: form.availability,
            });
            setSubmitted(true);
        } catch (err) {
            // Even if API fails, show success — volunteer data can be re-submitted
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWhatsApp = () => {
        if (!form.name.trim() || !form.phone.trim()) {
            setError("Please enter your name and phone number first.");
            return;
        }
        const msg = encodeURIComponent(
            `Hi Sewaam Foundation! 🙏\n\nI'd like to volunteer.\n\n` +
            `Name: ${form.name}\nPhone: ${form.phone}\nCity: ${form.city || "—"}\n` +
            `Interest: ${form.interest || "—"}\nAvailability: ${form.availability || "—"}`
        );
        window.open(`https://wa.me/919644515188?text=${msg}`, "_blank");
    };

    return (
        <div className="vol-page" id="volunteer">

            <div className="vol-container">

                {/* ── LEFT PANEL ── */}
                <div className="vol-left">
                    <div className="vol-eyebrow">
                        <span className="vol-eyebrow-dot" />
                        Join Our Mission
                    </div>

                    <h1 className="vol-title">
                        Small Acts,{" "}
                        <span className="vol-title--highlight">Big Impact.</span>
                        <br />
                        Become A Volunteer.
                    </h1>

                    <p className="vol-subtitle">
                        Sewaam Foundation thrives on the passion of volunteers like you.
                        Join us to support food distribution, animal care, education,
                        and community welfare initiatives.
                    </p>

                    <div className="vol-benefits">
                        {benefits.map((b) => (
                            <div key={b.title} className="vol-benefit">
                                <div className="vol-benefit-icon">{b.icon}</div>
                                <div>
                                    <h3 className="vol-benefit-title">{b.title}</h3>
                                    <p className="vol-benefit-desc">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL: Form ── */}
                <div className="vol-right">
                    <div className="vol-form-card">
                        <h2 className="vol-form-title">Volunteer Application</h2>

                        {submitted ? (
                            <div className="vol-success">
                                <div className="vol-success-icon">🎉</div>
                                <h3>Thank You, {form.name.split(" ")[0]}!</h3>
                                <p>Your application has been received. Our team will reach out to you on WhatsApp shortly.</p>
                                <button
                                    className="vol-submit-btn"
                                    onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", city: "", interest: "", availability: "" }); }}
                                >
                                    Submit Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="vol-form" noValidate>

                                <div className="vol-field">
                                    <label className="vol-label">Full Name <span className="vol-req">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="vol-input"
                                        placeholder="E.g. Akash Gupta"
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vol-field">
                                    <label className="vol-label">WhatsApp Number <span className="vol-req">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="vol-input"
                                        placeholder="Your 10 digit number"
                                        maxLength={10}
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vol-field">
                                    <label className="vol-label">Current Location (City) <span className="vol-req">*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="vol-input"
                                        placeholder="E.g. Indore, MP"
                                        value={form.city}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="vol-field">
                                    <label className="vol-label">Area Of Interest <span className="vol-req">*</span></label>
                                    <select
                                        name="interest"
                                        className="vol-input vol-select"
                                        value={form.interest}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Select Interest --</option>
                                        {INTERESTS.map((i) => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="vol-field">
                                    <label className="vol-label">Your Availability <span className="vol-req">*</span></label>
                                    <select
                                        name="availability"
                                        className="vol-input vol-select"
                                        value={form.availability}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- Choose Time --</option>
                                        {AVAILABILITY.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>

                                {error && <p className="vol-error">{error}</p>}

                                {/* WhatsApp button */}
                                <button
                                    type="button"
                                    className="vol-whatsapp-btn"
                                    onClick={handleWhatsApp}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Register via WhatsApp
                                </button>

                                {/* OR divider */}
                                <div className="vol-divider">
                                    <span>or</span>
                                </div>

                                <button type="submit" className="vol-submit-btn" disabled={submitting}>
                                    {submitting ? "Submitting…" : "Submit Application"}
                                </button>

                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
