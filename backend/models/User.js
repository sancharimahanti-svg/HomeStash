const mongoose = require("mongoose");

// Define the shape of a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,              // removes extra spaces
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,            // no two users can share an email
      lowercase: true,         // stores email in lowercase always
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    role: {
      type: String,
      enum: ["admin", "member"],   // only these two values allowed
      default: "member",
    },
  },
  {
    timestamps: true,   // auto-adds createdAt and updatedAt fields
  }
);

// Create the Model from the Schema
const User = mongoose.model("User", userSchema);

module.exports = User;