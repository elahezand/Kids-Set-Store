const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const notifyUser = require("../utils/notify");

/*  Order item   */
const orderItemSchema = new Schema({
  productId: { type: Types.ObjectId, ref: "Listing", required: true },
  variantId: { type: Types.ObjectId, default: null },
  store: { type: Types.ObjectId, ref: "Store", default: null },

  quantity: { type: Number, required: true, min: 1 },

  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, required: true, min: 0 },
  productSnapshot: {
    title: { type: String, required: true },
    image: { type: String, default: null },
    slug: { type: String, default: null },
  },
  variantSnapshot: {
    attributes: { type: Map, of: String, default: null },
    sku: { type: String, default: null },
  },

  stockReserved: { type: Boolean, default: false },
  fulfillment: {
    status: { type: String, enum: ["pending", "shipped"], default: "pending" },
    trackingCode: { type: String, trim: true, default: null },
    shippedAt: { type: Date, default: null },
    estimatedDeliveryAt: { type: Date, default: null },
  },
  estimatedShipBy: { type: Date, default: null },
});

const orderCouponSchema = new Schema(
  {
    couponId: { type: Types.ObjectId, ref: "Coupon", required: true },
    code: { type: String, uppercase: true, trim: true },
    type: { type: String, enum: ["fixed", "percent"] },
    amount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0, default: null },
  },
  { _id: false }
);

const pricingSchema = new Schema(
  {
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    walletUsed: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, default: null },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, "Order items required"],
    },
    coupon: { type: orderCouponSchema, default: null },
    pricing: { type: pricingSchema, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["cash", "zarinpal", "wallet"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment: {
      authority: { type: String, default: null },
      refId: { type: String, default: null },
      paidAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["created", "processing", "shipped", "completed", "cancelled"],
      default: "created",
    },
    couponCounted: { type: Boolean, default: false },
    fundsReleasedAt: { type: Date, default: null },
    revertedAt: { type: Date, default: null },
    idempotencyKey: { type: String, default: null },
    finalizedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    expectedDeliveryAt: { type: Date, default: null },
    autoCompletedAt: { type: Date, default: null },
    cashOverdueNotifiedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    refundAmount: { type: Number, default: 0, min: 0 },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } }
);
orderSchema.index({ "payment.authority": 1 });
orderSchema.index({ "items.store": 1, createdAt: -1 });
orderSchema.pre("save", function () {
  this._statusChanged = this.isModified("status");
});
orderSchema.post("save", async function (doc) {
  if (!doc._statusChanged) return;
  const shortId = String(doc._id).slice(-6).toUpperCase();
  await notifyUser(
    doc.user,
    `Your order #${shortId} status changed to ${doc.status}`,
    { type: "order_status", link: `/dashboard/orders/${doc._id}` }
  );
});

orderSchema.pre("findOneAndUpdate", async function () {
  const doc = await this.model.findOne(this.getQuery()).select("status").lean();
  this._prevStatus = doc?.status;
});
orderSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;
  const update = this.getUpdate() || {};
  const newStatus = update.status ?? update.$set?.status;
  if (!newStatus || newStatus === this._prevStatus) return;
  const shortId = String(doc._id).slice(-6).toUpperCase();
  await notifyUser(
    doc.user,
    `Your order #${shortId} status changed to ${newStatus}`,
    { type: "order_status", link: `/dashboard/orders/${doc._id}` }
  );
});

orderSchema.pre("updateOne", async function () {
  const doc = await this.model.findOne(this.getQuery()).select("status").lean();
  this._prevStatus = doc?.status;
});
orderSchema.post("updateOne", async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (!doc) return;
  const update = this.getUpdate() || {};
  const newStatus = update.status ?? update.$set?.status;
  if (!newStatus || newStatus === this._prevStatus) return;
  const shortId = String(doc._id).slice(-6).toUpperCase();
  await notifyUser(
    doc.user,
    `Your order #${shortId} status changed to ${newStatus}`,
    { type: "order_status", link: `/dashboard/orders/${doc._id}` }
  );
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = Order;