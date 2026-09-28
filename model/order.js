import mongoose from "mongoose";

const { Schema, Types } = mongoose;

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending", 
  PAID: "paid",
  PROCESSING: "processing", 
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELED: "canceled",
});

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: "unpaid",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
});

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

/* ---------- Sub schemas ---------- */
const orderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    img: { type: String, default: null },
    size: { type: String, trim: true, default: null },
    color: { type: String, trim: true, default: null },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const pricingSchema = new Schema(
  {
    itemsTotal: { type: Number, min: 0, default: 0 }, 
    subtotal: { type: Number, required: true, min: 0 }, 
    discount: { type: Number, min: 0, default: 0 },
    shippingCost: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 }, 
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    method: { type: String, trim: true, default: null },
    transactionId: { type: String, trim: true, default: null },
    paidAt: { type: Date, default: null },
  },
  { _id: false }
);

/* ---------- Order ---------- */
const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },

    items: { type: [orderItemSchema], required: true },
    coupon: { type: Types.ObjectId, ref: "Coupon", default: null },

    pricing: { type: pricingSchema, required: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    payment: { type: paymentSchema, default: () => ({}) },

    shippingAddress: { type: shippingAddressSchema, required: true },

    trackingCode: { type: String, trim: true, default: null }, 
    cancelReason: { type: String, trim: true, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

orderSchema.index({ user: 1, createdAt: -1 }); 
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ "items.product": 1 }); 

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;