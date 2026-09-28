import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

const discountSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },

    percent: { type: Number, required: true, min: 1, max: 100 },
    product: { type: Types.ObjectId, ref: "Product", required: true },

    maxUses: { type: Number, required: true, min: 1 },
    uses: { type: Number, default: 0, min: 0 },
    usedBy: { type: [{ type: Types.ObjectId, ref: "User" }], default: [] },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },

    creator: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

discountSchema.index({ code: 1 }, { unique: true });
discountSchema.index({ product: 1, isActive: 1 });
discountSchema.index({ isActive: 1, expiresAt: 1 });

/* ---------- Statics ---------- */

const usableFilter = (code, userId) => {
  const now = new Date();

  return {
    code: String(code).trim().toUpperCase(),
    isActive: true,
    usedBy: { $ne: userId },
    $expr: { $lt: ["$uses", "$maxUses"] },
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
    ],
  };
};


discountSchema.statics.findUsable = function (code, userId) {
  return this.findOne(usableFilter(code, userId)).lean();
};

discountSchema.statics.redeem = function (code, userId) {
  return this.findOneAndUpdate(
    usableFilter(code, userId),
    { $inc: { uses: 1 }, $push: { usedBy: userId } },
    { new: true }
  ).lean();
};

const DiscountModel = mongoose.models.Discount || mongoose.model("Discount", discountSchema);

export default DiscountModel;