import { Link } from "react-router-dom";
import "./CampaignCard.css";

export function formatCurrencyLakhs(amount) {
    if (!amount || isNaN(amount)) return "₹0";
    const num = Number(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${num.toLocaleString("en-IN")}`;
}

export default function CampaignCard({ campaign }) {
    if (!campaign) return null;

    const id = campaign._id || campaign.id;
    const title = campaign.title || "Untitled Campaign";
    const targetAmount = campaign.targetAmount || campaign.goal || 100000;
    const raisedAmount = campaign.raisedAmount || 0;
    const donorsCount = campaign.donorsCount
        || (raisedAmount > 0 ? Math.max(1, Math.round(raisedAmount / 1250)) : 0);
    const percentage = targetAmount > 0
        ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
        : 0;

    return (
        <article className="cc-card">

            {/* ── Image ── */}
            <div className="cc-img-wrap">
                <Link to={`/campaigns/${id}`} tabIndex={-1} aria-hidden="true">
                    {campaign.image ? (
                        <img src={campaign.image} alt={title} className="cc-img" />
                    ) : (
                        <div className="cc-img-placeholder">🤝</div>
                    )}
                </Link>

                {/* top-left logo */}
                <div className="cc-logo-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e03040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span>Sewaam</span>
                </div>

                {/* top-right tax badge */}
                {campaign.hasTaxBenefit && (
                    <div className="cc-tax-badge">Tax Benefit</div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="cc-body">
                <h3 className="cc-title">
                    <Link to={`/campaigns/${id}`}>{title}</Link>
                </h3>

                {/* organiser line */}
                <p className="cc-organiser">
                    By <span className="cc-organiser-name">Sewaam Foundation</span>
                </p>

                {/* raised + donors */}
                <div className="cc-stats-row">
                    <span>Raised: <strong>{raisedAmount.toLocaleString("en-IN")}</strong></span>
                    <span>Donors: <strong>{donorsCount}</strong></span>
                </div>

                {/* progress bar */}
                <div className="cc-progress-track">
                    <div className="cc-progress-fill" style={{ width: `${Math.max(percentage, 1)}%` }} />
                </div>

                {/* donate button */}
                <Link to={`/campaigns/${id}`} className="cc-donate-btn">
                    Donate Now
                </Link>
            </div>
        </article>
    );
}
