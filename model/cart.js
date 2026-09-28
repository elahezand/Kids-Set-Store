const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const CART_STATUS = Object.freeze({
  ACTIVE: "active",
  ABANDONED: "abandoned",
  CONVERTED: "converted",
});

/* ---------- Cart item ---------- */
const cartItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Listing", required: true },
    variantId: { type: Types.ObjectId, default: null },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

/* ---------- Cart ---------- */
const cartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    items: { type: [cartItemSchema], default: [] },
    coupon: { type: Types.ObjectId, ref: "Coupon", default: null },
    shippingCost: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: Object.values(CART_STATUS),
      default: CART_STATUS.ACTIVE,
    },
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

/* ---------- Indexes ---------- */
cartSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: CART_STATUS.ACTIVE } }
);
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

module.exports = Cart;
module.exports.CART_STATUS = CART_STATUS;