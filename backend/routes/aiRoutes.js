const express = require("express");
const router = express.Router();
const { autoFillItem } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/autofill", protect, autoFillItem);

module.exports = router;