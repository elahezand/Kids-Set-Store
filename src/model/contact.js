const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^09\d{9}$/,
      index: true,
    },

    body: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
      index: true,
    },

    answer: {
      type: String,
      default: null,
    },

    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------- Indexes ---------- */

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

module.exports = Contact