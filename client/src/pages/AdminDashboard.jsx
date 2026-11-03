import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function api(path, opts = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...opts,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

// Upload a base64 image to Cloudinary via our backend
async function uploadToCloudinary(base64, folder = "sewaam/campaigns") {
    if (!base64 || base64.startsWith("http") || base64.startsWith("/")) {
        return base64; // already a URL or preset path — skip upload
    }
    try {
        const res = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: base64, folder }),
        });
        const result = await res.json();
        if (!result.success) {
            throw new Error(result.message || "Image upload failed");
        }
        return result.url;
    } catch (err) {
        console.error("Upload error:", err.message);
        throw new Error(`Image upload failed: ${err.message}`);
    }
}

const TABS = [
    { id: "HeroSlider", label: "Hero Slider", icon: "🖼️" },
    { id: "Campaigns", label: "Donation Campaigns", icon: "📢" },
    { id: "Our Work", label: "Our Work (Reels & Stories)", icon: "🎬" },
    { id: "Donation Items", label: "Essential Needs Items", icon: "📦" },
    { id: "Donations", label: "Received Donations", icon: "💰" },
    { id: "Volunteers", label: "Volunteers", icon: "🙌" },
    { id: "Contacts", label: "Inquiries & Messages", icon: "✉️" },
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Campaigns");

    // Guard — redirect if not logged in
    useEffect(() => {
        if (!sessionStorage.getItem("admin_auth")) {
            navigate("/admin", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("admin_auth");
        navigate("/admin", { replace: true });
    };

    return (
        <div className="admin-dashboard-wrap">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div>
                    <div className="sidebar-brand-box">
                        <img 
                            src="/images/sewaam-logo.png" 
                            alt="Sewaam" 
                            className="sidebar-logo-img"
                        />
                        <div className="sidebar-brand-text">
                            <strong>Sewaam Admin</strong>
                            <small>Management Panel</small>
                        </div>
                    </div>

                    <nav className="sidebar-nav-list">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`sidebar-nav-btn ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="sidebar-icon">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    <Link to="/" style={{ display: "block", color: "#9ca3af", fontSize: "12.5px", marginBottom: "12px", textAlign: "center", textDecoration: "none" }}>
                        ← Back to Website
                    </Link>
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="admin-main-area">
                <header className="admin-top-header">
                    <div className="admin-header-title">
                        <h2>{TABS.find((t) => t.id === activeTab)?.label}</h2>
                        <p>Create, update, and manage your foundation&apos;s website content.</p>
                    </div>

                    <div className="admin-quick-stats">
                        <span className="quick-pill">Status: <strong>Online</strong></span>
                    </div>
                </header>

                <div className="admin-body-content">
                    {activeTab === "HeroSlider" && <HeroSliderPanel />}
                    {activeTab === "Campaigns" && <CampaignsPanel />}
                    {activeTab === "Our Work" && <OurWorkPanel />}
                    {activeTab === "Donation Items" && <DonationItemsPanel />}
                    {activeTab === "Donations" && <DonationsPanel />}
                    {activeTab === "Volunteers" && <VolunteersPanel />}
                    {activeTab === "Contacts" && <ContactsPanel />}
                </div>
            </main>
        </div>
    );
}

// ── Direct File Image Uploader Component ─────────────────────────────
function DirectImageUploader({ value, onChange, label = "Upload Image" }) {
    const [mode, setMode] = useState("file"); // "file" or "url"
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file (PNG, JPG, JPEG, WEBP, SVG)");
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleClear = () => {
        onChange("");
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="form-field-group full-width">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="field-label">{label} *</label>
                <div className="image-uploader-tabs">
                    <button
                        type="button"
                        className={`uploader-tab-btn ${mode === "file" ? "active" : ""}`}
                        onClick={() => setMode("file")}
                    >
                        📁 Upload Directly from Device
                    </button>
                    <button
                        type="button"
                        className={`uploader-tab-btn ${mode === "url" ? "active" : ""}`}
                        onClick={() => setMode("url")}
                    >
                        🔗 Image URL / Presets
                    </button>
                </div>
            </div>

            {mode === "file" ? (
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />

                    {!value ? (
                        <div
                            className="direct-upload-box"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <div className="upload-icon-circle">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <div className="upload-prompt-text">
                                Click here to browse photo from your device, or drag &amp; drop it here
                            </div>
                            <div className="upload-sub-text">
                                Upload JPG, PNG, WEBP, or SVG directly without needing an image link
                            </div>
                        </div>
                    ) : (
                        <div className="uploaded-preview-banner">
                            <div className="uploaded-preview-left">
                                <img src={value} alt="Uploaded" className="uploaded-preview-img" />
                                <div className="uploaded-preview-info">
                                    <strong>{fileName || "Photo Attached"}</strong>
                                    <small>✓ Image ready to publish</small>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    type="button"
                                    className="btn-cancel-action"
                                    style={{ padding: "6px 12px", fontSize: "12px" }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose Different Photo
                                </button>
                                <button
                                    type="button"
                                    className="btn-remove-upload"
                                    onClick={handleClear}
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        placeholder="Paste image URL (https://...) or choose a preset"
                        className="field-input"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="sample-presets-row">
                        <span style={{ fontSize: "11.5px", color: "#666" }}>Presets:</span>
                        <button type="button" className="preset-chip-btn" onClick={() => onChange("/images/campaign-elderly.jpg")}>Elders Shelter</button>
                        <button type="button" className="preset-chip-btn" onClick={() => onChange("/images/campaign-child-education.jpg")}>Child Education</button>
                        <button type="button" className="preset-chip-btn" onClick={() => onChange("/images/campaign-temple-restoration.jpg")}>Temple Restoration</button>
                        <button type="button" className="preset-chip-btn" onClick={() => onChange("/images/hero-banner.jpg")}>Volunteer &amp; Dog</button>
                    </div>

                    {value && (
                        <div className="image-preview-container">
                            <img src={value} alt="Preview" className="preview-thumb-img" onError={(e) => { e.target.style.display = "none"; }} />
                            <span className="preview-caption">Live Preview</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Products Editor (for campaign Products tab) ───────────────────────
function ProductsEditor({ products = [], onChange }) {
    const fileRefs = useRef([]);

    const addProduct = () => {
        onChange([...products, { id: Date.now(), name: "", price: "", donated: 0, goal: 100, image: "" }]);
    };

    const removeProduct = (index) => {
        onChange(products.filter((_, i) => i !== index));
    };

    const updateField = (index, field, value) => {
        const next = products.map((p, i) => i === index ? { ...p, [field]: value } : p);
        onChange(next);
    };

    const handleImageFile = (index, file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => updateField(index, "image", e.target.result);
        reader.readAsDataURL(file);
    };

    return (
        <div className="form-field-group full-width">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <label className="field-label">
                    Products <span style={{ fontWeight: 400, color: "#888" }}>(shown in the Products tab on the campaign page)</span>
                </label>
                <button type="button" className="products-add-btn" onClick={addProduct}>
                    + Add Product
                </button>
            </div>

            {products.length === 0 && (
                <div className="products-empty-hint">
                    No products added yet. Click <strong>+ Add Product</strong> to add items users can donate (e.g. Dog Food, Medicine Kit).
                </div>
            )}

            <div className="products-list">
                {products.map((product, index) => {
                    // Ensure each product has a stable ref slot
                    if (!fileRefs.current[index]) fileRefs.current[index] = null;
                    return (
                        <div key={product.id || index} className="product-editor-row">

                            {/* Image picker */}
                            <div className="product-img-picker">
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    ref={(el) => { fileRefs.current[index] = el; }}
                                    onChange={(e) => handleImageFile(index, e.target.files[0])}
                                />
                                {product.image ? (
                                    <div className="product-img-preview" onClick={() => fileRefs.current[index]?.click()}>
                                        <img src={product.image} alt="product" />
                                        <div className="product-img-change-overlay">Change</div>
                                    </div>
                                ) : (
                                    <div className="product-img-empty" onClick={() => fileRefs.current[index]?.click()}>
                                        <span>📷</span>
                                        <small>Upload</small>
                                    </div>
                                )}
                            </div>

                            {/* Fields */}
                            <div className="product-fields">
                                <input
                                    className="field-input"
                                    placeholder="Product name (e.g. Dog Food 5kg)"
                                    value={product.name}
                                    onChange={(e) => updateField(index, "name", e.target.value)}
                                />
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        className="field-input"
                                        type="number"
                                        min="1"
                                        placeholder="Price (₹)"
                                        value={product.price}
                                        onChange={(e) => updateField(index, "price", e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        className="field-input"
                                        type="number"
                                        min="1"
                                        placeholder="Goal qty"
                                        value={product.goal}
                                        onChange={(e) => updateField(index, "goal", e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Remove */}
                            <button
                                type="button"
                                className="product-remove-btn"
                                onClick={() => removeProduct(index)}
                                aria-label="Remove product"
                            >✕</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Gallery Images Uploader (multi-image for campaign slider) ────────
function GalleryImagesUploader({ images = [], onChange }) {
    const fileInputRef = useRef(null);

    const handleFiles = (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
        if (!validFiles.length) return;

        const readers = validFiles.map(file => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        }));

        Promise.all(readers).then(newImgs => {
            onChange([...images, ...newImgs]);
        });
    };

    const handleRemove = (index) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const handleMove = (index, dir) => {
        const next = [...images];
        const swapIdx = index + dir;
        if (swapIdx < 0 || swapIdx >= next.length) return;
        [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
        onChange(next);
    };

    return (
        <div className="form-field-group full-width">
            <label className="field-label">
                Slider Gallery Images <span style={{ fontWeight: 400, color: "#888" }}>(optional — these appear in the image carousel on the campaign page)</span>
            </label>

            {/* Thumbnails */}
            {images.length > 0 && (
                <div className="gallery-upload-thumbs">
                    {images.map((src, i) => (
                        <div key={i} className="gallery-thumb-item">
                            <img src={src} alt={`Slide ${i + 1}`} className="gallery-thumb-img" />
                            <div className="gallery-thumb-overlay">
                                <span className="gallery-thumb-index">{i + 1}</span>
                                <div className="gallery-thumb-actions">
                                    {i > 0 && (
                                        <button type="button" onClick={() => handleMove(i, -1)} title="Move left">◀</button>
                                    )}
                                    {i < images.length - 1 && (
                                        <button type="button" onClick={() => handleMove(i, 1)} title="Move right">▶</button>
                                    )}
                                    <button type="button" onClick={() => handleRemove(i)} title="Remove" className="gallery-thumb-remove">✕</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add more button */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
            />
            <button
                type="button"
                className="gallery-add-btn"
                onClick={() => fileInputRef.current?.click()}
            >
                + Add Slider Images {images.length > 0 ? `(${images.length} added)` : ""}
            </button>
            {images.length > 0 && (
                <p style={{ fontSize: "11.5px", color: "#888", margin: "6px 0 0" }}>
                    Drag to reorder using ◀ ▶ arrows. First image shows by default.
                </p>
            )}
        </div>
    );
}

// ── 0. HERO SLIDER PANEL ─────────────────────────────────────────────
function HeroSliderPanel() {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const MAX_SLIDES = 4;

    const emptySlide = () => ({ image: "", title: "", subtitle: "", buttonLabel: "Donate Now", buttonLink: "/donate" });

    const [slides, setSlides]   = useState([emptySlide()]);
    const [saving, setSaving]   = useState(false);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg]         = useState(null);
    const fileRefs              = useRef([]);

    // Load existing slides
    useEffect(() => {
        fetch(`${BASE_URL}/hero-slides`)
            .then((r) => r.json())
            .then((d) => {
                if (d?.slides?.length > 0) {
                    setSlides(d.slides.map((s) => ({ ...emptySlide(), ...s })));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const addSlide = () => {
        if (slides.length >= MAX_SLIDES) return;
        setSlides((prev) => [...prev, emptySlide()]);
    };

    const removeSlide = (i) => {
        setSlides((prev) => prev.filter((_, idx) => idx !== i));
    };

    const updateSlide = (i, field, value) => {
        setSlides((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    };

    const handleImageFile = (i, file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => updateSlide(i, "image", e.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        try {
            // Upload any base64 images to Cloudinary first
            const uploaded = [];
            for (let i = 0; i < slides.length; i++) {
                const s = slides[i];
                if (!s.title.trim()) { setMsg({ type: "error", text: `Slide ${i + 1}: Title is required.` }); setSaving(false); return; }
                if (!s.image) { setMsg({ type: "error", text: `Slide ${i + 1}: Please upload an image.` }); setSaving(false); return; }

                setMsg({ type: "info", text: `⏳ Uploading image ${i + 1}/${slides.length}...` });
                const imgUrl = s.image.startsWith("data:")
                    ? await uploadToCloudinary(s.image, "sewaam/hero-slider")
                    : s.image;

                uploaded.push({ ...s, image: imgUrl });
            }

            setMsg({ type: "info", text: "💾 Saving slides..." });
            const res = await fetch(`${BASE_URL}/hero-slides`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slides: uploaded }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Save failed");

            setSlides(data.slides.map((s) => ({ ...emptySlide(), ...s })));
            setMsg({ type: "success", text: "✅ Hero slider updated! Changes are live on the home page." });
        } catch (err) {
            setMsg({ type: "error", text: `❌ ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading slides…</div>;

    return (
        <div>
            <div className="panel-action-bar">
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                        Hero Slider — Home Page Banner
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#666" }}>
                        Upload up to 4 images. They auto-rotate on the home page with title and description.
                    </p>
                </div>
                {slides.length < MAX_SLIDES && (
                    <button className="btn-primary-action" type="button" onClick={addSlide}>
                        + Add Slide ({slides.length}/{MAX_SLIDES})
                    </button>
                )}
            </div>

            {msg && <div className={`admin-alert-banner ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleSave}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {slides.map((slide, i) => (
                        <div key={i} className="admin-card-form" style={{ position: "relative", padding: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#171717" }}>
                                    Slide {i + 1}
                                </h4>
                                {slides.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSlide(i)}
                                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                                    >
                                        Remove Slide
                                    </button>
                                )}
                            </div>

                            <div className="form-fields-grid">
                                {/* Image uploader */}
                                <div className="form-field-group full-width">
                                    <label className="field-label">Slide Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        ref={(el) => { fileRefs.current[i] = el; }}
                                        onChange={(e) => handleImageFile(i, e.target.files[0])}
                                    />
                                    {!slide.image ? (
                                        <div
                                            className="direct-upload-box"
                                            onClick={() => fileRefs.current[i]?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); handleImageFile(i, e.dataTransfer.files[0]); }}
                                        >
                                            <div className="upload-icon-circle">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <div className="upload-prompt-text">Click to upload slide image (JPG, PNG, WEBP)</div>
                                            <div className="upload-sub-text">Recommended: 1400 × 500 px landscape image</div>
                                        </div>
                                    ) : (
                                        <div className="uploaded-preview-banner" style={{ alignItems: "flex-start" }}>
                                            <div className="uploaded-preview-left">
                                                <img
                                                    src={slide.image}
                                                    alt={`Slide ${i + 1}`}
                                                    style={{ width: "120px", height: "68px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e5e7" }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                <button type="button" className="btn-cancel-action" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => fileRefs.current[i]?.click()}>
                                                    Change Image
                                                </button>
                                                <button type="button" className="btn-remove-upload" onClick={() => updateSlide(i, "image", "")}>✕ Remove</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="form-field-group full-width">
                                    <label className="field-label">Slide Title *</label>
                                    <input
                                        className="field-input"
                                        placeholder="e.g. Help Feed & Care for Animals Who Have No One"
                                        value={slide.title}
                                        onChange={(e) => updateSlide(i, "title", e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Subtitle */}
                                <div className="form-field-group full-width">
                                    <label className="field-label">Subtitle / Description</label>
                                    <textarea
                                        className="field-input"
                                        rows="2"
                                        placeholder="Short description shown below the title on the slider."
                                        value={slide.subtitle}
                                        onChange={(e) => updateSlide(i, "subtitle", e.target.value)}
                                        style={{ resize: "vertical" }}
                                    />
                                </div>

                                {/* Button */}
                                <div className="form-field-group">
                                    <label className="field-label">Button Label</label>
                                    <input
                                        className="field-input"
                                        placeholder="Donate Now"
                                        value={slide.buttonLabel}
                                        onChange={(e) => updateSlide(i, "buttonLabel", e.target.value)}
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Button Link</label>
                                    <input
                                        className="field-input"
                                        placeholder="/donate or /campaigns/slug"
                                        value={slide.buttonLink}
                                        onChange={(e) => updateSlide(i, "buttonLink", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                    <button
                        type="submit"
                        className="btn-primary-action"
                        disabled={saving}
                        style={{ minWidth: "180px" }}
                    >
                        {saving ? "Saving…" : "💾 Save & Publish Slider"}
                    </button>
                    <span style={{ fontSize: "12.5px", color: "#888" }}>
                        Changes go live on the home page immediately after saving.
                    </span>
                </div>
            </form>
        </div>
    );
}

// ── 1. CAMPAIGNS (DONATION CAUSES) PANEL ─────────────────────────────
function CampaignsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [editId, setEditId] = useState(null); // null = create, id = edit

    const [form, setForm] = useState({
        title: "",
        slug: "",
        targetAmount: "",
        category: "Elders",
        image: "",
        gallery: [],
        products: [],
        description: "",
        status: "Active",
        featured: true,
        hasTaxBenefit: true,
    });

    const load = () => {
        setLoading(true);

        api("/campaigns")
            .then((d) => {
                const apiItems = d.campaigns || [];
                // Always show MongoDB data as source of truth; sync localStorage
                try {
                    localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(apiItems));
                } catch (_) {}
                setItems(apiItems);
            })
            .catch(() => {
                // API failed — fall back to localStorage but strip stale custom_ items
                let localCampaigns = [];
                try {
                    const raw = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
                    localCampaigns = raw.filter((c) => !String(c._id || "").startsWith("custom_"));
                } catch (_) {}
                setItems(localCampaigns);
            })
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: type === "checkbox" ? checked : value };
            if (name === "title" && !prev.slugManuallyEdited) {
                next.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
            }
            return next;
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        try {
            setMsg({ type: "info", text: "⏳ Uploading cover image..." });
            // 1. Upload cover image to Cloudinary
            const coverUrl = await uploadToCloudinary(form.image, "sewaam/campaigns");

            // 2. Upload gallery images to Cloudinary ONE BY ONE (not Promise.all — mobile hotspot can't handle it)
            let galleryUrls = [];
            if (form.gallery && form.gallery.length > 0) {
                for (let i = 0; i < form.gallery.length; i++) {
                    setMsg({ type: "info", text: `⏳ Uploading gallery image ${i + 1}/${form.gallery.length}...` });
                    const url = await uploadToCloudinary(form.gallery[i], "sewaam/campaigns");
                    galleryUrls.push(url);
                }
            }

            // 3. Upload product images to Cloudinary ONE BY ONE
            const productsWithUrls = [];
            for (let i = 0; i < (form.products || []).length; i++) {
                const p = form.products[i];
                setMsg({ type: "info", text: `⏳ Uploading product image ${i + 1}/${form.products.length}...` });
                const imgUrl = await uploadToCloudinary(p.image, "sewaam/products");
                productsWithUrls.push({
                    ...p,
                    price: Number(p.price) || 0,
                    goal:  Number(p.goal)  || 100,
                    image: imgUrl,
                });
            }

            setMsg({ type: "info", text: "💾 Saving campaign..." });

            const newCampaign = {
                title:        form.title.trim(),
                slug:         (form.slug || form.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `cause-${Date.now()}`,
                targetAmount: Number(form.targetAmount) || 100000,
                raisedAmount: 0,
                donorsCount:  0,
                category:     form.category || "Community",
                image:        coverUrl,
                gallery:      galleryUrls,
                products:     productsWithUrls,
                description:  form.description || "",
                status:       form.status || "Active",
                featured:     Boolean(form.featured),
                hasTaxBenefit:Boolean(form.hasTaxBenefit),
            };

            // Save to backend API (MongoDB will generate proper _id)
            let savedCampaign;
            try {
                const response = await api("/campaigns", {
                    method: "POST",
                    body: JSON.stringify(newCampaign),
                });
                savedCampaign = response.campaign;
            } catch (apiErr) {
                throw new Error(apiErr.message || "Failed to save campaign to database");
            }

            // Also save to localStorage for immediate display
            try {
                const currentList = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
                localStorage.setItem("sewaam_custom_campaigns", JSON.stringify([savedCampaign, ...currentList]));
            } catch (_) {}

            setMsg({ type: "success", text: "✅ Donation campaign published successfully! It is now live on the website." });
            setShowForm(false);
            setForm({
                title: "", slug: "", targetAmount: "", category: "Elders",
                image: "", gallery: [], products: [], description: "",
                status: "Active", featured: true, hasTaxBenefit: true,
            });
            load();
        } catch (err) {
            setMsg({ type: "error", text: `❌ ${err.message || "Failed to publish campaign."}` });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            const currentList = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
            localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(currentList.filter((c) => c._id !== id)));
        } catch (_) {}

        try {
            await api(`/campaigns/${id}`, { method: "DELETE" });
        } catch (_) {}

        load();
    };

    const handleEdit = (campaign) => {
        setEditId(campaign._id);
        setForm({
            title:        campaign.title || "",
            slug:         campaign.slug || "",
            targetAmount: campaign.targetAmount || "",
            category:     campaign.category || "Elders",
            image:        campaign.image || "",
            gallery:      campaign.gallery || [],
            products:     (campaign.products || []).map((p, i) => ({ ...p, id: p.id || p._id || i })),
            description:  campaign.description || "",
            status:       campaign.status || "Active",
            featured:     campaign.featured !== false,
            hasTaxBenefit:campaign.hasTaxBenefit !== false,
        });
        setShowForm(true);
        setMsg(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        try {
            setMsg({ type: "info", text: "⏳ Uploading images..." });

            // Upload cover if changed (base64) or keep existing URL
            const coverUrl = form.image?.startsWith("data:")
                ? await uploadToCloudinary(form.image, "sewaam/campaigns")
                : form.image;

            // Upload product images if changed
            const productsWithUrls = [];
            for (let i = 0; i < (form.products || []).length; i++) {
                const p = form.products[i];
                const imgUrl = p.image?.startsWith("data:")
                    ? await uploadToCloudinary(p.image, "sewaam/products")
                    : p.image;
                productsWithUrls.push({ ...p, price: Number(p.price) || 0, goal: Number(p.goal) || 100, image: imgUrl });
            }

            setMsg({ type: "info", text: "💾 Saving changes..." });

            const updated = {
                title:        form.title.trim(),
                slug:         form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                targetAmount: Number(form.targetAmount) || 100000,
                category:     form.category || "Community",
                image:        coverUrl,
                products:     productsWithUrls,
                description:  form.description || "",
                status:       form.status || "Active",
                featured:     Boolean(form.featured),
                hasTaxBenefit:Boolean(form.hasTaxBenefit),
            };

            await api(`/campaigns/${editId}`, {
                method: "PUT",
                body: JSON.stringify(updated),
            });

            // Update localStorage too
            try {
                const currentList = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
                const updatedList = currentList.map((c) => c._id === editId ? { ...c, ...updated } : c);
                localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(updatedList));
            } catch (_) {}

            setMsg({ type: "success", text: "✅ Campaign updated successfully!" });
            setShowForm(false);
            setEditId(null);
            setForm({ title: "", slug: "", targetAmount: "", category: "Elders", image: "", gallery: [], products: [], description: "", status: "Active", featured: true, hasTaxBenefit: true });
            load();
        } catch (err) {
            setMsg({ type: "error", text: `❌ ${err.message || "Failed to update campaign."}` });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="panel-action-bar">
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                        All Donation Causes ({items.length})
                    </h3>
                </div>
                <button
                    className={showForm ? "btn-cancel-action" : "btn-primary-action"}
                    onClick={() => {
                        if (showForm) {
                            setShowForm(false);
                            setEditId(null);
                            setForm({ title: "", slug: "", targetAmount: "", category: "Elders", image: "", gallery: [], products: [], description: "", status: "Active", featured: true, hasTaxBenefit: true });
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? "Cancel" : "+ Create New Donation Cause"}
                </button>
            </div>

            {msg && <div className={`admin-alert-banner ${msg.type}`}>{msg.text}</div>}

            {showForm && (
                <form onSubmit={editId ? handleUpdate : handleCreate} className="admin-card-form">
                    <h4 className="form-header-title">{editId ? "✏️ Edit Campaign" : "Create a New Donation Campaign"}</h4>

                    <div className="form-fields-grid">
                        <div className="form-field-group">
                            <label className="field-label">Campaign / Cause Title *</label>
                            <input
                                name="title"
                                placeholder="e.g. Their Home Is Gone! These Elders Have No Shelter!"
                                className="field-input"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">URL Slug *</label>
                            <input
                                name="slug"
                                placeholder="e.g. elders-shelter-drive"
                                className="field-input"
                                value={form.slug}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">Fundraising Target Amount (₹) *</label>
                            <input
                                name="targetAmount"
                                type="number"
                                min="1"
                                placeholder="e.g. 5000000 (50 Lakhs)"
                                className="field-input"
                                value={form.targetAmount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">Category *</label>
                            <select
                                name="category"
                                className="field-select"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="Elders">Elders &amp; Senior Citizens</option>
                                <option value="Children">Child Education &amp; Health</option>
                                <option value="Animals">Animal Welfare &amp; Rescue</option>
                                <option value="Heritage">Heritage &amp; Temple Restoration</option>
                                <option value="Healthcare">Medical &amp; Cancer Care</option>
                                <option value="Food">Food &amp; Nutrition Relief</option>
                                <option value="Community">Community &amp; Shelter</option>
                                <option value="Other">Other Causes</option>
                            </select>
                        </div>

                        <DirectImageUploader
                            value={form.image}
                            onChange={(img) => setForm((f) => ({ ...f, image: img }))}
                            label="Campaign Photo / Cover Image"
                        />

                        {/* ── Slider Gallery Images ── */}
                        <GalleryImagesUploader
                            images={form.gallery}
                            onChange={(imgs) => setForm((f) => ({ ...f, gallery: imgs }))}
                        />

                        {/* ── Products ── */}
                        <ProductsEditor
                            products={form.products}
                            onChange={(prods) => setForm((f) => ({ ...f, products: prods }))}
                        />

                        <div className="form-field-group full-width">
                            <label className="field-label">Description / Cause Story *</label>
                            <textarea
                                name="description"
                                placeholder="Describe why this cause needs immediate support and how funds will be used..."
                                className="field-textarea"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="form-checkbox-row">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="hasTaxBenefit"
                                checked={form.hasTaxBenefit}
                                onChange={handleChange}
                            />
                            80G Tax Benefit Eligible
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={form.featured}
                                onChange={handleChange}
                            />
                            Feature on Homepage
                        </label>

                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                            <label className="field-label">Status:</label>
                            <select
                                name="status"
                                className="field-select"
                                style={{ width: "auto", padding: "6px 12px" }}
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active (Public)</option>
                                <option value="Draft">Draft (Hidden)</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-action" disabled={saving}>
                        {saving
                            ? (editId ? "Saving Changes…" : "Uploading images & Publishing…")
                            : (editId ? "Save Changes" : "Publish Donation Cause")}
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading causes…</p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Cause &amp; Photo</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Raised</th>
                                <th>Target Goal</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                <tr key={c._id}>
                                    <td>
                                        <div className="table-media-cell">
                                            {c.image ? (
                                                <img src={c.image} alt={c.title} className="table-media-thumb" />
                                            ) : (
                                                <div className="table-media-thumb" style={{ background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>🤝</div>
                                            )}
                                            <span className="table-media-title">{c.title}</span>
                                        </div>
                                    </td>
                                    <td>{c.category}</td>
                                    <td>
                                        <span className={`badge-tag badge-${(c.status || "active").toLowerCase()}`}>
                                            {c.status || "Active"}
                                        </span>
                                    </td>
                                    <td><strong>₹{(c.raisedAmount || 0).toLocaleString("en-IN")}</strong></td>
                                    <td>₹{(c.targetAmount || 0).toLocaleString("en-IN")}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button className="btn-edit-row" onClick={() => handleEdit(c)}>
                                                Edit
                                            </button>
                                            <button className="btn-delete-row" onClick={() => handleDelete(c._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                            No custom campaigns found yet. Click <strong>&quot;+ Create New Donation Cause&quot;</strong> to add one!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── 3. ESSENTIAL NEEDS ITEMS PANEL ───────────────────────────────────
function DonationItemsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const [form, setForm] = useState({
        name: "",
        price: "",
        unit: "kit",
        category: "Food",
        image: "/images/atta-10kg.png",
        description: "",
        isAvailable: true,
        isFeatured: true,
        sortOrder: 0,
    });

    const load = () => {
        setLoading(true);
        api("/donation-items")
            .then((d) => setItems(d.items || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        try {
            await api("/donation-items", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    sortOrder: Number(form.sortOrder || 0),
                }),
            });
            setMsg({ type: "success", text: "Donation item created successfully!" });
            setShowForm(false);
            setForm({
                name: "",
                price: "",
                unit: "kit",
                category: "Food",
                image: "/images/atta-10kg.png",
                description: "",
                isAvailable: true,
                isFeatured: true,
                sortOrder: 0,
            });
            load();
        } catch (err) {
            setMsg({ type: "error", text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this donation item?")) return;
        try {
            await api(`/donation-items/${id}`, { method: "DELETE" });
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <div className="panel-action-bar">
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                        Essential Needs Items ({items.length})
                    </h3>
                </div>
                <button
                    className={showForm ? "btn-cancel-action" : "btn-primary-action"}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "+ Add Essential Need Item"}
                </button>
            </div>

            {msg && <div className={`admin-alert-banner ${msg.type}`}>{msg.text}</div>}

            {showForm && (
                <form onSubmit={handleCreate} className="admin-card-form">
                    <h4 className="form-header-title">Create Essential Need Donation Item</h4>

                    <div className="form-fields-grid">
                        <div className="form-field-group">
                            <label className="field-label">Item Name *</label>
                            <input
                                name="name"
                                placeholder="e.g. 10 Kg Aata or First Aid Kit"
                                className="field-input"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">Donation Price (₹) *</label>
                            <input
                                name="price"
                                type="number"
                                min="1"
                                placeholder="e.g. 501"
                                className="field-input"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">Category *</label>
                            <select
                                name="category"
                                className="field-select"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="Food">Food &amp; Groceries</option>
                                <option value="Healthcare">Healthcare &amp; First Aid</option>
                                <option value="Animal Welfare">Animal Food &amp; Medicine</option>
                                <option value="Education">School Books &amp; Supplies</option>
                                <option value="Clothing">Warm Clothes &amp; Blankets</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-field-group">
                            <label className="field-label">Unit Type</label>
                            <input
                                name="unit"
                                placeholder="e.g. kit, bag, packet, family"
                                className="field-input"
                                value={form.unit}
                                onChange={handleChange}
                            />
                        </div>

                        <DirectImageUploader
                            value={form.image}
                            onChange={(img) => setForm((f) => ({ ...f, image: img }))}
                            label="Product / Item Photo"
                        />

                        <div className="form-field-group full-width">
                            <label className="field-label">Description / Impact Note *</label>
                            <textarea
                                name="description"
                                placeholder="e.g. Provide essential nourishing food for a family of four for one week."
                                className="field-textarea"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="form-checkbox-row">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={form.isAvailable}
                                onChange={handleChange}
                            />
                            Available for Donation
                        </label>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={form.isFeatured}
                                onChange={handleChange}
                            />
                            Feature on Homepage
                        </label>
                    </div>

                    <button type="submit" className="btn-primary-action" disabled={saving}>
                        {saving ? "Creating…" : "Create Donation Item"}
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading items…</p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Item &amp; Photo</th>
                                <th>Donation Amount</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>Available</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="table-media-cell">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="table-media-thumb" />
                                            ) : (
                                                <div className="table-media-thumb" style={{ background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
                                            )}
                                            <span className="table-media-title">{item.name}</span>
                                        </div>
                                    </td>
                                    <td><strong>₹{item.price.toLocaleString("en-IN")}</strong></td>
                                    <td>{item.category}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.isAvailable ? "✅ Yes" : "❌ No"}</td>
                                    <td>
                                        <button className="btn-delete-row" onClick={() => handleDelete(item._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                            No essential needs items in database yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── 4. RECEIVED DONATIONS PANEL ──────────────────────────────────────
function DonationsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api("/donations")
            .then((d) => setItems(d.donations || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="panel-action-bar">
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                    Donations Received ({items.length})
                </h3>
            </div>

            {loading ? (
                <p>Loading donations…</p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Donor</th>
                                <th>Email</th>
                                <th>Amount</th>
                                <th>Campaign / Cause</th>
                                <th>Payment Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((d) => (
                                <tr key={d._id}>
                                    <td><strong>{d.isAnonymous ? "Anonymous Donor" : d.donorName}</strong></td>
                                    <td>{d.email}</td>
                                    <td><strong style={{ color: "#e60023" }}>₹{d.amount.toLocaleString("en-IN")}</strong></td>
                                    <td>{d.campaign?.title || "General Donation"}</td>
                                    <td>
                                        <span className={`badge-tag badge-${(d.paymentStatus || "completed").toLowerCase()}`}>
                                            {d.paymentStatus || "Completed"}
                                        </span>
                                    </td>
                                    <td>{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                            No donations recorded yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── 5. VOLUNTEERS PANEL ──────────────────────────────────────────────
function VolunteersPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api("/volunteers")
            .then((d) => setItems(d.volunteers || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const updateStatus = async (id, status) => {
        try {
            await api(`/volunteers/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <div className="panel-action-bar">
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                    Volunteer Applications ({items.length})
                </h3>
            </div>

            {loading ? (
                <p>Loading volunteers…</p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Status</th>
                                <th>Change Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((v) => (
                                <tr key={v._id}>
                                    <td><strong>{v.fullName}</strong></td>
                                    <td>{v.email}</td>
                                    <td>{v.phone}</td>
                                    <td>{v.city || "—"}</td>
                                    <td>
                                        <span className={`badge-tag badge-${(v.status || "pending").toLowerCase()}`}>
                                            {v.status || "Pending"}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="field-select"
                                            style={{ width: "auto", padding: "4px 8px", fontSize: "12.5px" }}
                                            value={v.status}
                                            onChange={(e) => updateStatus(v._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                            No volunteer applications yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── 6. CONTACT MESSAGES PANEL ────────────────────────────────────────
function ContactsPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api("/contact")
            .then((d) => setItems(d.contacts || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const updateStatus = async (id, status) => {
        try {
            await api(`/contact/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            await api(`/contact/${id}`, { method: "DELETE" });
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <div className="panel-action-bar">
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                    Inquiries &amp; Messages ({items.length})
                </h3>
            </div>

            {loading ? (
                <p>Loading messages…</p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((c) => (
                                <tr key={c._id}>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.email}</td>
                                    <td>{c.subject}</td>
                                    <td>
                                        <select
                                            className="field-select"
                                            style={{ width: "auto", padding: "4px 8px", fontSize: "12.5px" }}
                                            value={c.status}
                                            onChange={(e) => updateStatus(c._id, e.target.value)}
                                        >
                                            <option value="New">New</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                                    <td>
                                        <button className="btn-delete-row" onClick={() => handleDelete(c._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                            No messages received yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── OUR WORK PANEL ───────────────────────────────────────────────────
function OurWorkPanel() {
    const STORAGE_KEY = "sewaam_our_work";
    const CATEGORIES = ["Animal Care", "Food Distribution", "Rescue", "Community Help", "Awareness"];

    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { return []; }
    });
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        caption: "",
        link: "",
        category: "Animal Care",
        thumb: "",
    });
    const [msg, setMsg] = useState(null);

    const save = (updated) => {
        setItems(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.caption.trim()) {
            setMsg({ type: "error", text: "Title and caption are required." });
            return;
        }
        const newItem = {
            id: `work_${Date.now()}`,
            title: form.title.trim(),
            caption: form.caption.trim(),
            link: form.link.trim(),
            category: form.category,
            thumb: form.thumb.trim() || "",
            image: form.thumb.trim() || "",
            createdAt: new Date().toISOString(),
        };
        save([newItem, ...items]);
        setMsg({ type: "success", text: "Work item published successfully!" });
        setShowForm(false);
        setForm({ title: "", caption: "", link: "", category: "Animal Care", thumb: "" });
    };

    const handleDelete = (id) => {
        if (!window.confirm("Delete this item?")) return;
        save(items.filter((i) => i.id !== id));
    };

    return (
        <div>
            <div className="panel-action-bar">
                <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                        Our Work Items ({items.length})
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
                        Add Instagram Reels or YouTube links with a title and caption to display on the Our Work page.
                    </p>
                </div>
                <button
                    className={showForm ? "btn-cancel-action" : "btn-primary-action"}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "+ Add Work Item"}
                </button>
            </div>

            {msg && <div className={`admin-alert-banner ${msg.type}`}>{msg.text}</div>}

            {showForm && (
                <form onSubmit={handleCreate} className="admin-card-form">
                    <h4 className="form-header-title">Add New Work Item</h4>
                    <div className="form-fields-grid">
                        <div className="form-field-group full-width">
                            <label className="field-label">Title *</label>
                            <input
                                name="title"
                                placeholder="e.g. Gau Seva Feeding Drive 🐄"
                                className="field-input"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field-group full-width">
                            <label className="field-label">Caption / Message *</label>
                            <textarea
                                name="caption"
                                placeholder="Write a short message about this work — what was done, who was helped, impact..."
                                className="field-textarea"
                                value={form.caption}
                                onChange={handleChange}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="form-field-group full-width">
                            <label className="field-label">Instagram Reel / YouTube Link (optional)</label>
                            <input
                                name="link"
                                placeholder="https://www.instagram.com/reel/... or https://youtu.be/..."
                                className="field-input"
                                value={form.link}
                                onChange={handleChange}
                            />
                            <small style={{ color: "#888", fontSize: "12px" }}>
                                Paste an Instagram Reel URL or YouTube link. A play button will appear on the card.
                            </small>
                        </div>

                        <DirectImageUploader
                            value={form.thumb}
                            onChange={(img) => setForm((f) => ({ ...f, thumb: img }))}
                            label="Thumbnail Image"
                        />

                        <div className="form-field-group">
                            <label className="field-label">Category</label>
                            <select
                                name="category"
                                className="field-select"
                                value={form.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-action">
                        Publish to Our Work Page
                    </button>
                </form>
            )}

            {/* List */}
            {items.length === 0 ? (
                <p style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                    No items yet. Click "+ Add Work Item" to publish your first story.
                </p>
            ) : (
                <div className="table-responsive-box">
                    <table className="modern-admin-table">
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Caption</th>
                                <th>Category</th>
                                <th>Link</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <img
                                            src={item.thumb || item.image}
                                            alt={item.title}
                                            className="table-media-thumb"
                                            onError={(e) => { e.target.src = "/images/hero-banner.jpg"; }}
                                        />
                                    </td>
                                    <td><strong>{item.title}</strong></td>
                                    <td style={{ maxWidth: "200px", whiteSpace: "normal", fontSize: "12.5px", color: "#666" }}>
                                        {item.caption?.slice(0, 80)}{item.caption?.length > 80 ? "…" : ""}
                                    </td>
                                    <td>{item.category}</td>
                                    <td>
                                        {item.link ? (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "#f5a623", fontSize: "12px" }}>
                                                View ↗
                                            </a>
                                        ) : "—"}
                                    </td>
                                    <td>
                                        <button className="btn-delete-row" onClick={() => handleDelete(item.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
