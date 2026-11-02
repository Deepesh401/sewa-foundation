import { Link } from "react-router-dom";
import { useState } from "react";
import "./About.css";

export default function About() {
    const [openFAQ, setOpenFAQ] = useState(0);

    const faqs = [
        {
            question: "What is Sewaam Foundation?",
            answer: "Sewaam Foundation is dedicated to creating positive change by supporting people, animals, and communities in need. Through our initiatives, we work to provide essential resources, promote education, care for animals, support elderly people, and help families facing difficult circumstances."
        },
        {
            question: "How do I know my donation is being used properly?",
            answer: "We aim to maintain transparency and accountability in every donation. Contributions are directed toward the intended campaign or initiative, and we strive to share updates, activity reports, and information about the impact of our work with our supporters."
        },
        {
            question: "What causes can I support?",
            answer: "You can support a range of causes, including children's education, food and nutrition, animal rescue and welfare, elderly care, support for underprivileged families, disaster relief, and community development. Explore our active campaigns to choose a cause that matters to you."
        },
        {
            question: "What is monthly giving, and why does it matter?",
            answer: "Monthly giving allows you to contribute a fixed amount regularly to a cause you care about. Recurring donations can help us plan activities, provide consistent support, and respond more effectively to ongoing community needs. Please check the available recurring donation options before subscribing."
        },
        {
            question: "Can I support more than one cause?",
            answer: "Absolutely! You can contribute to multiple campaigns according to your interests and budget. Each campaign supports a different need, so you can choose where you would like your contribution to make a difference."
        },
        {
            question: "How else can I contribute besides donating?",
            answer: "There are many ways to help beyond financial contributions. You can volunteer your time, participate in our activities, donate useful supplies, spread awareness about our campaigns, or explore partnerships with us. Every act of support can help strengthen our community initiatives."
        },
        {
            question: "Can I volunteer with Sewaam Foundation?",
            answer: "Yes! If you want to make a difference, you can express your interest through our Volunteer page. You may be able to assist with community outreach, food distribution, educational activities, animal care, and other initiatives, depending on current requirements."
        },
        {
            question: "Can I donate food, clothes, books, or other supplies?",
            answer: "Yes, depending on the needs of our ongoing initiatives, useful supplies such as food, clothing, school books, stationery, and essential items may be accepted. Please contact our team before arranging a donation so we can confirm the items required and the delivery process."
        },
        {
            question: "Will I receive confirmation after making a donation?",
            answer: "Donation confirmation depends on the payment method and the available donation system. Please retain your payment receipt or transaction reference. If you do not receive confirmation, contact our support team with the relevant transaction details."
        },
        {
            question: "Can I donate on behalf of someone else?",
            answer: "Yes, you can make a donation in honour of a friend, family member, or loved one. Where available, you may include their name or a dedication while making your contribution."
        },
        {
            question: "How can I stay updated about Sewaam Foundation's activities?",
            answer: "You can follow our website and official social media channels for campaign announcements, volunteer activities, community initiatives, and updates about our work."
        },
        {
            question: "How can I contact Sewaam Foundation for more information?",
            answer: "You can reach out through the Contact Us page on our website. Share your question or concern along with your contact details, and our team can guide you regarding donations, volunteering, campaigns, and partnerships."
        }
    ];

    return (
        <div className="about-page">

            {/* ── Hero Banner ── */}
            <div className="about-hero">
                {/* Text overlaid in the cream center gap of the collage */}
                <div className="about-hero-center">
                    <h1 className="about-hero-title">
                        About <span className="about-hero-title--highlight">Us</span>
                    </h1>
                    <div className="about-hero-pills">
                        <span>People</span>
                        <span className="about-hero-divider">|</span>
                        <span>Community</span>
                        <span className="about-hero-divider">|</span>
                        <span>Compassion</span>
                        <span className="about-hero-divider">|</span>
                        <span>Change</span>
                    </div>
                </div>
            </div>

            {/* ── About Sewaam Section ── */}
            <section className="about-intro-section">
                <div className="about-container about-intro-grid">

                    {/* Left: Text */}
                    <div className="about-intro-text">
                        <h2 className="about-intro-heading">
                            About<br />
                            <span className="about-intro-heading--highlight">Sewaam Foundation</span>
                        </h2>
                        <p className="about-intro-tagline">
                            A people-first initiative dedicated to serving communities, supporting the underprivileged, and creating a kinder, healthier, and more inclusive society.
                        </p>

                        <div className="about-story-label">
                            <span>🌿</span> Our Story
                        </div>

                        <p className="about-intro-body">
                            Sewaam Foundation began its journey in Indore in mid-2024 with a simple yet powerful mission — to bring meaningful change in the lives of people, animals, and communities across India.
                        </p>
                        <p className="about-intro-body">
                            From distributing food and essentials to underprivileged families, feeding stray animals, supporting education, and working for community well-being, we believe that small acts of kindness can create a big and lasting impact.
                        </p>

                        {/* Bottom pills */}
                        <div className="about-intro-pills">
                            <div className="about-intro-pill">
                                <span className="about-pill-icon">👥</span>
                                <span>People<br/>Support</span>
                            </div>
                            <div className="about-intro-pill-divider" />
                            <div className="about-intro-pill">
                                <span className="about-pill-icon">🐾</span>
                                <span>Animal<br/>Care</span>
                            </div>
                            <div className="about-intro-pill-divider" />
                            <div className="about-intro-pill">
                                <span className="about-pill-icon">🎓</span>
                                <span>Education<br/>Support</span>
                            </div>
                            <div className="about-intro-pill-divider" />
                            <div className="about-intro-pill">
                                <span className="about-pill-icon">🤝</span>
                                <span>Community<br/>Development</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: collage image */}
                    <div className="about-collage">
                        <img
                            src="/images/Sewaam Foundation Community Care Collage.png"
                            alt="Sewaam Foundation work collage"
                            className="about-collage-img"
                            onError={(e) => { e.target.src = "/images/about-us-collage.png"; }}
                        />
                    </div>

                </div>
            </section>

            {/* ── What We Do ── */}
            <section className="about-section about-section--light">
                <div className="about-container">
                    <span className="about-mini-tag" style={{ display: "block", textAlign: "center" }}>WHAT WE DO</span>
                    <h2 className="about-section-title" style={{ textAlign: "center", marginBottom: "36px" }}>Our Initiatives</h2>
                    <div className="about-initiatives-grid">
                        {[
                            { emoji: "🍱", title: "Meals for Elders & Hungry", desc: "Hot meals delivered daily to elderly citizens and hungry families across villages and urban slums." },
                            { emoji: "🐾", title: "Stray Animal Rescue & Care", desc: "Rescuing, treating, feeding, and rehoming stray animals. Medical care for injured street dogs and cattle." },
                            { emoji: "📚", title: "Child Education Support", desc: "Providing school supplies, uniforms, and learning resources to underprivileged children across India." },
                            { emoji: "🏥", title: "Disaster Relief & Healthcare", desc: "Rapid response teams for flood, drought, and other disasters — distributing essential kits and medical aid." },
                        ].map((i) => (
                            <div key={i.title} className="about-initiative-card">
                                <div className="about-initiative-emoji">{i.emoji}</div>
                                <h3>{i.title}</h3>
                                <p>{i.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ Section ── */}
            <section className="about-faq-section">
                <div className="about-container">
                    <h2 className="about-faq-title">
                        Frequently <span className="about-faq-title--highlight">Asked Questions</span>
                    </h2>
                    
                    <div className="about-faq-list">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`about-faq-item ${openFAQ === index ? 'about-faq-item--open' : ''}`}
                            >
                                <button 
                                    className="about-faq-question"
                                    onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                                >
                                    <span>{faq.question}</span>
                                    <svg 
                                        className="about-faq-icon" 
                                        width="24" 
                                        height="24" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                    >
                                        <path 
                                            d="M19 9L12 16L5 9" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                                <div className="about-faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="about-cta-section">
                <div className="about-container about-cta-inner">
                    <div>
                        <h2>Ready to Make a Difference?</h2>
                        <p>Join thousands of donors who are changing lives every day.</p>
                    </div>
                    <div className="about-cta-btns">
                        <Link to="/campaigns" className="about-cta-btn about-cta-btn--primary">Donate Now →</Link>
                        <a href="https://www.instagram.com/sewaamfoundation/" target="_blank" rel="noopener noreferrer" className="about-cta-btn about-cta-btn--outline">Follow Us</a>
                    </div>
                </div>
            </section>

        </div>
    );
}
