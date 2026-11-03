const SiteSettings = require("../models/SiteSettings");

// GET /api/hero-slides — public, returns current slides
const getHeroSlides = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});
        const slides = (settings.heroSlides || [])
            .sort((a, b) => a.order - b.order);
        res.json({ success: true, slides });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/hero-slides — admin, replaces all slides
const updateHeroSlides = async (req, res) => {
    try {
        const { slides } = req.body;
        if (!Array.isArray(slides)) {
            return res.status(400).json({ success: false, message: "slides must be an array" });
        }
        if (slides.length > 4) {
            return res.status(400).json({ success: false, message: "Maximum 4 slides allowed" });
        }

        const normalised = slides.map((s, i) => ({
            image:       s.image       || "",
            title:       s.title       || "",
            subtitle:    s.subtitle    || "",
            buttonLabel: s.buttonLabel || "Donate Now",
            buttonLink:  s.buttonLink  || "/donate",
            order:       i,
        }));

        let settings = await SiteSettings.findOne();
        if (!settings) settings = await SiteSettings.create({});
        settings.heroSlides = normalised;
        await settings.save();

        res.json({ success: true, slides: settings.heroSlides });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getHeroSlides, updateHeroSlides };
