const express = require("express");
const router = express.Router();
const { addItem, getItems, getItem, updateItem, deleteItem, getAlerts } = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);   // all routes protected

router.get("/alerts", getAlerts);   // ← must be before /:id
router.post("/", addItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;