import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer-wrap" id="contact">
            <div className="footer-inner">

                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <Link to="/" className="footer-logo-link">
                        <img
                            src="/images/sewaam-logo.png"
                            alt="Sewaam Foundation"
                            className="footer-logo-img"
                            onError={(e) => { e.target.onerror = null; e.target.src = "/images/sewaam-logo.svg"; }}
                        />
                    </Link>
                    <p className="footer-brand-desc">
                        Sewaam Foundation is dedicated to empowering vulnerable communities, feeding elders and hungry families, rescuing animals, and educating children across India.
                    </p>

                    {/* Social links */}
                    <div className="footer-socials">
                        {/* YouTube */}
                        <a
                            href="https://www.youtube.com/@Sewaamfoundation"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social-btn footer-social-btn--yt"
                            aria-label="YouTube"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/>
                            </svg>
                            YouTube
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/sewaamfoundation/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social-btn footer-social-btn--ig"
                            aria-label="Instagram"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
                        </a>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="footer-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-links-list">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/campaigns">Featured Campaigns</Link></li>
                        <li><a href="/#about">About Our Mission</a></li>
                        <li><a href="/#needs">Essential Needs</a></li>
                        <li><Link to="/campaigns">Donate Now</Link></li>
                    </ul>
                </div>

                {/* Initiatives Column */}
                <div className="footer-col">
                    <h4 className="footer-heading">Our Initiatives</h4>
                    <ul className="footer-links-list">
                        <li><span>Meals for Elders & Hungry</span></li>
                        <li><span>Stray Animal Rescue & Care</span></li>
                        <li><span>Child Education Support</span></li>
                        <li><span>Disaster Relief & Healthcare</span></li>
                    </ul>
                </div>

                {/* Contact Column */}
                <div className="footer-col contact-col">
                    <h4 className="footer-heading">Get in Touch</h4>
                    <p className="footer-contact-item">
                        <span className="footer-contact-icon">📍</span>
                        73 Ganesh Ganj, Bada Ganpati, Indore.
                    </p>
                    <p className="footer-contact-item">
                        <span className="footer-contact-icon">✉️</span>
                        Support@Sewaam.Com
                    </p>
                    <p className="footer-contact-item">
                        <span className="footer-contact-icon">📞</span>
                        +91 96445 15186
                    </p>

                    {/* UPI QR Code */}
                    <div className="footer-qr-wrap">
                        <img
                            src="/images/upi-qr.png"
                            alt="Scan to Donate via UPI"
                            className="footer-qr-img"
                            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                        />
                        <div className="footer-qr-fallback" style={{ display: "none" }}>
                            <span>📱</span>
                        </div>
                        <p className="footer-qr-label">Scan & Pay via UPI</p>
                    </div>

                    <Link to="/campaigns" className="footer-donate-pill">
                        Donate Now →
                    </Link>
                </div>
            </div>

            {/* Bottom bar — payment icons + copyright */}
            <div className="footer-bottom-bar">
                <div className="footer-bottom-inner">
                    <span>© {new Date().getFullYear()} Sewaam Foundation. All rights reserved.</span>

                    {/* Payment methods */}
                    <div className="footer-payments">
                        <span className="footer-payments-label">We accept</span>

                        {/* UPI */}
                        <div className="footer-pay-chip" title="UPI">
                            <svg viewBox="0 0 48 48" width="36" height="20" xmlns="http://www.w3.org/2000/svg">
                                <text x="2" y="32" fontSize="18" fontWeight="900" fill="#5f259f" fontFamily="Arial">UPI</text>
                            </svg>
                        </div>

                        {/* Visa */}
                        <div className="footer-pay-chip" title="Visa">
                            <svg viewBox="0 0 48 16" width="42" height="16">
                                <text x="0" y="14" fontSize="14" fontWeight="900" fill="#1a1f71" fontFamily="Arial" letterSpacing="-0.5">VISA</text>
                            </svg>
                        </div>

                        {/* Mastercard */}
                        <div className="footer-pay-chip footer-pay-chip--mc" title="Mastercard">
                            <svg viewBox="0 0 38 24" width="38" height="24">
                                <circle cx="14" cy="12" r="10" fill="#eb001b"/>
                                <circle cx="24" cy="12" r="10" fill="#f79e1b"/>
                                <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#ff5f00"/>
                            </svg>
                        </div>

                        {/* RuPay */}
                        <div className="footer-pay-chip" title="RuPay">
                            <svg viewBox="0 0 60 20" width="46" height="20">
                                <text x="0" y="15" fontSize="13" fontWeight="800" fill="#016938" fontFamily="Arial">Ru</text>
                                <text x="20" y="15" fontSize="13" fontWeight="800" fill="#e8692a" fontFamily="Arial">Pay</text>
                            </svg>
                        </div>

                        {/* Net Banking */}
                        <div className="footer-pay-chip" title="Net Banking" style={{ fontSize: "10px", fontWeight: 700, color: "#444", padding: "3px 7px" }}>
                            Net Banking
                        </div>
                    </div>

                    <span className="footer-slogan">Kindness Feeds Lives.</span>
                </div>
            </div>
        </footer>
    );
}
