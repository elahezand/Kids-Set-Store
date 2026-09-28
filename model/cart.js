import mongoose from "mongoose";

const { Schema, Types } = mongoose;

export const CART_STATUS = Object.freeze({
    ACTIVE: "active",
    ABANDONED: "abandoned",
    CONVERTED: "converted",
});

const toJSONTransform = (doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
};

/* ---------- Sub schemas ---------- */
const cartItemSchema = new Schema(
    {
        product: { type: Types.ObjectId, ref: "Product", required: true },
        size: { type: String, trim: true, default: null },
        color: { type: String, trim: true, default: null },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, default: 1 },
    },
    { _id: false }
);

const pricingSchema = new Schema(
    {
        itemsTotal: { type: Number, min: 0, default: 0 },
        subtotal: { type: Number, min: 0, default: 0 },
        discount: { type: Number, min: 0, default: 0 },
        shippingCost: { type: Number, min: 0, default: 0 },
        total: { type: Number, min: 0, default: 0 },
    },
    { _id: false }
);

/* ---------- Cart ---------- */
const cartSchema = new Schema(
    {
        user: { type: Types.ObjectId, ref: "User", required: true },
        items: { type: [cartItemSchema], default: [] },
        coupon: { type: Types.ObjectId, ref: "Coupon", default: null },
        pricing: { type: pricingSchema, default: () => ({}) },
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
        toJSON: { transform: toJSONTransform },
        toObject: { transform: toJSONTransform },
    }
);

/* ---------- Indexes ---------- */
cartSchema.index(
    { user: 1 },
    { unique: true, partialFilterExpression: { status: CART_STATUS.ACTIVE } }
);
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default CartModel;