const express = require("express");
const router  = express.Router();
const { getHeroSlides, updateHeroSlides } = require("../controllers/heroSliderController");

router.get("/",  getHeroSlides);
router.put("/",  updateHeroSlides);

module.exports = router;
