const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getAnalytics,
  getDashboard,
} = require("../controllers/expenseController");

router.use(protect);

// important: specific routes before /:id
router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);

router.route("/")
  .get(getExpenses)
  .post(addExpense);

router.route("/:id")
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;