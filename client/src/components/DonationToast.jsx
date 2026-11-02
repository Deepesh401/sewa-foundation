import { useEffect, useState } from "react";
import "./DonationToast.css";

/**
 * DonationToast — appears on every page when someone completes a payment.
 * CampaignDetails writes to localStorage("sewaam_last_donation") on verify success.
 * This component listens for that storage event and shows the popup.
 */
export default function DonationToast() {
    const [toast, setToast] = useState(null); // { name, amount, campaign }
    const [visible, setVisible] = useState(false);

    const showToast = (data) => {
        setToast(data);
        setVisible(true);
        // Auto-dismiss after 6 seconds
        setTimeout(() => setVisible(false), 6000);
    };

    useEffect(() => {
        // Listen for donations from other tabs / same page
        const handleStorage = (e) => {
            if (e.key === "sewaam_last_donation" && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    showToast(data);
                } catch (_) {}
            }
        };
        window.addEventListener("storage", handleStorage);

        // Also check on mount — in case donation just happened on this same tab
        const handleSameTab = (e) => {
            if (e.detail) showToast(e.detail);
        };
        window.addEventListener("sewaam_donation_made", handleSameTab);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("sewaam_donation_made", handleSameTab);
        };
    }, []);

    if (!toast) return null;

    return (
        <div className={`donation-toast ${visible ? "donation-toast--in" : "donation-toast--out"}`}
             role="status"
             aria-live="polite"
        >
            <div className="donation-toast__icon">🎉</div>
            <div className="donation-toast__body">
                <p className="donation-toast__name">
                    <strong>{toast.name}</strong> just donated
                </p>
                <p className="donation-toast__amount">₹{Number(toast.amount).toLocaleString("en-IN")}</p>
                {toast.campaign && (
                    <p className="donation-toast__campaign">to <em>{toast.campaign}</em></p>
                )}
            </div>
            <button
                className="donation-toast__close"
                onClick={() => setVisible(false)}
                aria-label="Close"
            >✕</button>
        </div>
    );
}
