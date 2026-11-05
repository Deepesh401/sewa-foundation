import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MyDonations.css";

export default function MyDonations() {
    const { user, logout, getMyDonations, loading: authLoading } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading]     = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) { navigate("/"); return; }
        if (user) {
            getMyDonations()
                .then(setDonations)
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="my-donations-loading">
                <div className="my-donations-spinner" />
                <p>Loading your donations…</p>
            </div>
        );
    }

    const total = donations.filter(d => d.paymentStatus === "Successful").reduce((s, d) => s + d.amount, 0);

    return (
        <div className="my-donations-page">
            <div className="my-donations-container">

                {/* Header */}
                <div className="my-donations-header">
                    <div className="my-donations-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="my-donations-name">{user?.name}</h1>
                        <p className="my-donations-email">{user?.email}</p>
                    </div>
                    <button className="my-donations-logout" onClick={() => { logout(); navigate("/"); }}>
                        Sign Out
                    </button>
                </div>

                {/* Summary */}
                <div className="my-donations-summary">
                    <div className="my-sum-box">
                        <div className="my-sum-number">{donations.length}</div>
                        <div className="my-sum-label">Total Donations</div>
                    </div>
                    <div className="my-sum-box">
                        <div className="my-sum-number">₹{total.toLocaleString("en-IN")}</div>
                        <div className="my-sum-label">Total Contributed</div>
                    </div>
                    <div className="my-sum-box">
                        <div className="my-sum-number">
                            {donations.filter(d => d.paymentStatus === "Successful").length}
                        </div>
                        <div className="my-sum-label">Successful</div>
                    </div>
                </div>

                {/* Donations list */}
                <h2 className="my-donations-section-title">Your Donation History</h2>

                {donations.length === 0 ? (
                    <div className="my-donations-empty">
                        <p>You haven't made any donations yet.</p>
                        <Link to="/campaigns" className="my-donations-cta">Explore Campaigns →</Link>
                    </div>
                ) : (
                    <div className="my-donations-list">
                        {donations.map((d) => (
                            <div key={d._id} className="my-donation-row">
                                <div className="my-donation-img">
                                    {d.campaign?.image
                                        ? <img src={d.campaign.image} alt={d.campaign.title} />
                                        : <div className="my-donation-img-placeholder">🤝</div>
                                    }
                                </div>
                                <div className="my-donation-info">
                                    <div className="my-donation-campaign">
                                        {d.campaign?.title || "General Donation"}
                                    </div>
                                    <div className="my-donation-date">
                                        {new Date(d.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </div>
                                    {d.message && <div className="my-donation-msg">"{d.message}"</div>}
                                </div>
                                <div className="my-donation-right">
                                    <div className="my-donation-amount">
                                        ₹{Number(d.amount).toLocaleString("en-IN")}
                                    </div>
                                    <div className={`my-donation-status my-donation-status--${d.paymentStatus.toLowerCase()}`}>
                                        {d.paymentStatus}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "32px" }}>
                    <Link to="/campaigns" className="my-donations-cta">Donate Again →</Link>
                </div>
            </div>
        </div>
    );
}
