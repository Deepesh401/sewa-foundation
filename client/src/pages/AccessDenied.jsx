import { Link } from "react-router-dom";
import "./AccessDenied.css";

export default function AccessDenied() {
    return (
        <div className="ad-page">
            {/* Corner decorations */}
            <div className="ad-corner ad-corner--tl" />
            <div className="ad-corner ad-corner--br" />

            {/* Shield watermark */}
            <div className="ad-shield-watermark" aria-hidden="true">
                <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5L10 20V55C10 78 28 98 50 105C72 98 90 78 90 55V20L50 5Z" fill="#f0f0f0"/>
                    <rect x="38" y="50" width="24" height="20" rx="3" fill="#e0e0e0"/>
                    <path d="M44 50V44C44 40.7 46.7 38 50 38C53.3 38 56 40.7 56 44V50" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round"/>
                    <circle cx="50" cy="60" r="3" fill="#e0e0e0"/>
                </svg>
            </div>

            {/* Main content */}
            <div className="ad-content">
                {/* 4🔒4 */}
                <div className="ad-error-code">
                    <span className="ad-four">4</span>
                    <div className="ad-lock-circle">
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                            <rect x="13" y="20" width="18" height="14" rx="2.5" fill="#111"/>
                            <path d="M16 20V16C16 12.7 18.7 10 22 10C25.3 10 28 12.7 28 16V20" stroke="#111" strokeWidth="3" strokeLinecap="round"/>
                            <circle cx="22" cy="27" r="2.5" fill="#fff"/>
                            <line x1="22" y1="29" x2="22" y2="32" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {/* spark lines */}
                        <span className="ad-spark ad-spark--1" />
                        <span className="ad-spark ad-spark--2" />
                        <span className="ad-spark ad-spark--3" />
                    </div>
                    <span className="ad-four">4</span>
                </div>

                <h1 className="ad-title">
                    Access <span className="ad-title--yellow">Denied</span>
                </h1>

                <p className="ad-desc">
                    The admin panel you&apos;re looking for doesn&apos;t exist<br />
                    or you don&apos;t have permission to access it.
                </p>

                <Link to="/" className="ad-home-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Go to Home
                </Link>
            </div>
        </div>
    );
}
