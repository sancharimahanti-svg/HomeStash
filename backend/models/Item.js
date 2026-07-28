const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["dairy", "grains", "snacks", "beverages", "vegetables", "fruits", "meat", "oils", "masala", "pulses", "frozen", "cleaning", "other"],
      required: [true, "Category is required"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "pieces", "packets"],
      required: [true, "Unit is required"],
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    lowStockThreshold: {
      type: Number,
      default: 2,    // flag as low stock when quantity <= 2
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field — computed automatically, not stored in DB
itemSchema.virtual("status").get(function () {
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  if (this.quantity === 0) return "out_of_stock";
  if (this.expiryDate < today) return "expired";
  if (this.expiryDate <= threeDaysFromNow) return "near_expiry";
  if (this.quantity <= this.lowStockThreshold) return "low_stock";
  return "good";
});

// Make virtuals show up in JSON responses
itemSchema.set("toJSON", { virtuals: true });
itemSchema.set("toObject", { virtuals: true });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;