// models/coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["fixed", "percent"], required: true },
    amount: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0, default: null },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, min: 0, default: null },
    usedCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, expiresAt: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
module.exports = Coupon;