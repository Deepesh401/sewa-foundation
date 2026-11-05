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

                {/* raised + donors — 3 stat boxes */}
                <div className="cc-stats-boxes">
                    <div className="cc-stat-box">
                        <div className="cc-stat-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d7a1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div className="cc-stat-text">
                            <span className="cc-stat-label">Goal</span>
                            <span className="cc-stat-value">{formatCurrencyLakhs(targetAmount)}</span>
                        </div>
                    </div>
                    <div className="cc-stat-box">
                        <div className="cc-stat-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d7a1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                        <div className="cc-stat-text">
                            <span className="cc-stat-label">Raised</span>
                            <span className="cc-stat-value">{formatCurrencyLakhs(raisedAmount)}</span>
                        </div>
                    </div>
                    <div className="cc-stat-box">
                        <div className="cc-stat-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d7a1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="cc-stat-text">
                            <span className="cc-stat-label">Donors</span>
                            <span className="cc-stat-value">{donorsCount.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>

                {/* progress bar with percentage */}
                <div className="cc-progress-wrap">
                    <div className="cc-progress-track">
                        <div className="cc-progress-fill" style={{ width: `${Math.max(percentage, 1)}%` }} />
                    </div>
                    <span className="cc-progress-pct">{percentage}%</span>
                </div>

                {/* donate button */}
                <Link to={`/campaigns/${id}`} className="cc-donate-btn">
                    Donate Now
                </Link>
            </div>
        </article>
    );
}
