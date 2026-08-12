const Item = require("../models/Item");

// @desc    Add new item
// @route   POST /api/items
const addItem = async (req, res) => {
  try {
    const { name, category, quantity, unit,price, expiryDate, lowStockThreshold } = req.body;

    if (!name || !category || quantity === undefined || !unit || !expiryDate) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const item = await Item.create({
      name,
      category,
      quantity,
      unit,
      price,
      expiryDate,
      lowStockThreshold,
      owner: req.user._id,
    });

    res.status(201).json({ message: "Item added", item });
  } catch (error) {
    console.error("Add Item Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all items of logged in user
// @route   GET /api/items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id });
    res.status(200).json({ count: items.length, items });
  } catch (error) {
    console.error("Get Items Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error("Get Item Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: "Item updated", item: updated });
  } catch (error) {
    console.error("Update Item Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error("Delete Item Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get flagged items (expired, near expiry, low stock, out of stock)
// @route   GET /api/items/alerts
const getAlerts = async (req, res) => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const items = await Item.find({ owner: req.user._id });

    const alerts = {
      out_of_stock: items.filter(i => i.quantity === 0),
      expired: items.filter(i => i.expiryDate < today && i.quantity > 0),
      near_expiry: items.filter(i => i.expiryDate >= today && i.expiryDate <= threeDaysFromNow),
      low_stock: items.filter(i => i.quantity > 0 && i.quantity <= i.lowStockThreshold && i.expiryDate > today),
    };

    res.status(200).json({ alerts });
  } catch (error) {
    console.error("Alerts Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addItem, getItems, getItem, updateItem, deleteItem, getAlerts };