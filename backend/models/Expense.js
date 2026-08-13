const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    category: {
      type: String,
      lowercase: true,
      enum: ["groceries", "utilities", "rent", "transport", "medical",
             "entertainment", "clothing", "dining", "education", "other"],
      required: [true, "Category is required"],
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },

    // shared across household
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },

    // track who added it
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);