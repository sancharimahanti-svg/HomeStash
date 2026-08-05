const express = require("express");
const router = express.Router();
const { autoFillItem, generateShoppingList } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/autofill", protect, autoFillItem);
router.post("/shopping-list", protect, generateShoppingList);

module.exports = router;