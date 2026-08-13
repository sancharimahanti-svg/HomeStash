const Expense = require("../models/Expense");

const requireHousehold = (req, res) => {
  if (!req.user.household) {
    res.status(400).json({ message: "You must be part of a household first" });
    return false;
  }
  return true;
};

// @desc    Add expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const { title, amount, category, date, notes } = req.body;
    if (!title || !amount || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const expense = await Expense.create({
      title, amount, category,
      date: date || Date.now(),
      notes,
      household: req.user.household,
      addedBy: req.user._id,
    });

    const populated = await expense.populate("addedBy", "name");
    res.status(201).json({ message: "Expense added", expense: populated });
  } catch (error) {
    console.error("Add Expense Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all expenses (with optional month/year filter)
// @route   GET /api/expenses?month=7&year=2026
const getExpenses = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const { month, year } = req.query;
    let filter = { household: req.user.household };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter)
      .populate("addedBy", "name")
      .sort({ date: -1 });

    res.status(200).json({ count: expenses.length, expenses });
  } catch (error) {
    console.error("Get Expenses Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
const getExpense = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const expense = await Expense.findOne({
      _id: req.params.id,
      household: req.user.household,
    }).populate("addedBy", "name");

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ expense });
  } catch (error) {
    console.error("Get Expense Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update expense (admin or own)
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const expense = await Expense.findOne({
      _id: req.params.id,
      household: req.user.household,
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = expense.addedBy.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to edit this expense" });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    ).populate("addedBy", "name");

    res.status(200).json({ message: "Expense updated", expense: updated });
  } catch (error) {
    console.error("Update Expense Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete expense (admin or own)
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const expense = await Expense.findOne({
      _id: req.params.id,
      household: req.user.household,
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = expense.addedBy.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Analytics — category breakdown, member spend, 6-month trend
// @route   GET /api/expenses/analytics?month=7&year=2026
const getAnalytics = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const householdId = req.user.household;

    const [categoryBreakdown, memberBreakdown, last6Months, dailyBreakdown] =
      await Promise.all([

        // Per category this month
        Expense.aggregate([
          { $match: { household: householdId, date: { $gte: start, $lte: end } } },
          { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
        ]),

        // Per member this month
        Expense.aggregate([
          { $match: { household: householdId, date: { $gte: start, $lte: end } } },
          { $group: { _id: "$addedBy", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $project: { total: 1, count: 1, "user.name": 1, "user.email": 1 } },
          { $sort: { total: -1 } },
        ]),

        // Last 6 months trend
        Expense.aggregate([
          {
            $match: {
              household: householdId,
              date: { $gte: new Date(year, month - 7, 1), $lte: end },
            },
          },
          {
            $group: {
              _id: { year: { $year: "$date" }, month: { $month: "$date" } },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // Daily breakdown this month
        Expense.aggregate([
          { $match: { household: householdId, date: { $gte: start, $lte: end } } },
          { $group: { _id: { $dayOfMonth: "$date" }, total: { $sum: "$amount" } } },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const totalSpent = categoryBreakdown.reduce((s, c) => s + c.total, 0);
    const daysInMonth = new Date(year, month, 0).getDate();

    res.status(200).json({
      month, year,
      totalSpent,
      avgPerDay: Math.round(totalSpent / daysInMonth),
      categoryBreakdown,
      memberBreakdown,
      last6Months,
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Dashboard summary
// @route   GET /api/expenses/dashboard
const getDashboard = async (req, res) => {
  try {
    if (!requireHousehold(req, res)) return;

    const Item = require("../models/Item");
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    const householdId = req.user.household;

    const [recentExpenses, items, categoryBreakdown] = await Promise.all([
      Expense.find({ household: householdId, date: { $gte: start, $lte: end } })
        .populate("addedBy", "name")
        .sort({ date: -1 })
        .limit(5),

      Item.find({ household: householdId }),

      Expense.aggregate([
        { $match: { household: householdId, date: { $gte: start, $lte: end } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalMonthlySpend = categoryBreakdown.reduce((s, c) => s + c.total, 0);

    const alertCounts = {
      expired: items.filter((i) => i.expiryDate < now && i.quantity > 0).length,
      near_expiry: items.filter(
        (i) => i.expiryDate >= now && i.expiryDate <= threeDaysFromNow
      ).length,
      low_stock: items.filter(
        (i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold
      ).length,
      out_of_stock: items.filter((i) => i.quantity === 0).length,
    };

    res.status(200).json({
      totalMonthlySpend,
      categoryBreakdown,
      recentExpenses,
      totalItems: items.length,
      alertCounts,
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addExpense, getExpenses, getExpense,
  updateExpense, deleteExpense,
  getAnalytics, getDashboard,
};