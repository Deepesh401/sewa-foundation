import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DonationSuccess() {
    const [donation, setDonation] = useState(null);

    useEffect(() => {
        // Read last donation data from localStorage (set right before redirect)
        try {
            const data = JSON.parse(localStorage.getItem("sewaam_last_donation") || "null");
            if (data) {
                setDonation(data);
                // Fire toast on this page too (for other open tabs)
                window.dispatchEvent(new CustomEvent("sewaam_donation_made", { detail: data }));
            }
        } catch (_) {}
    }, []);

    return (
        <div style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            background: "#fafafc",
        }}>
            <div style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "48px 40px",
                maxWidth: "480px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                border: "1px solid #e5e5e7",
            }}>
                {/* Success icon */}
                <div style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    fontSize: "34px",
                }}>
                    ✓
                </div>

                <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#171717", margin: "0 0 10px" }}>
                    {donation?.name ? `Thank you, ${donation.name}!` : "Thank You!"}
                </h1>

                <p style={{ fontSize: "15px", color: "#555", margin: "0 0 8px", lineHeight: 1.6 }}>
                    Your donation of{" "}
                    <strong style={{ color: "#f5a623", fontSize: "18px" }}>
                        ₹{donation?.amount ? Number(donation.amount).toLocaleString("en-IN") : "—"}
                    </strong>{" "}
                    has been received successfully.
                </p>

                {donation?.campaign && (
                    <p style={{ fontSize: "13px", color: "#888", margin: "0 0 28px" }}>
                        for <em style={{ color: "#555", fontStyle: "normal", fontWeight: 600 }}>{donation.campaign}</em>
                    </p>
                )}

                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 32px", lineHeight: 1.6 }}>
                    A confirmation will be sent to your email. Your contribution goes a long way in making a difference. 💛
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/campaigns" style={{
                        background: "#f5a623",
                        color: "#fff",
                        padding: "12px 28px",
                        borderRadius: "10px",
                        fontWeight: "700",
                        fontSize: "14px",
                        textDecoration: "none",
                        transition: "background 0.2s",
                    }}>
                        Explore More Campaigns
                    </Link>
                    <Link to="/" style={{
                        background: "transparent",
                        color: "#555",
                        padding: "12px 28px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "14px",
                        textDecoration: "none",
                        border: "1.5px solid #e5e5e7",
                    }}>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
