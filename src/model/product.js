const mongoose = require("mongoose");
const { Schema } = mongoose;
const { nanoid } = require("nanoid");
const { calcFinalPrice, computeMinPrice } = require("@/utils/pricing");

const VariantSchema = new Schema(
  {
    attributes: {
      type: Map,
      of: String,
      required: [true, "Variant attributes are required"],
    },
    sku: { type: String, required: true, trim: true },
    price: { type: Number, required: [true, "Variant price is required"], min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    images: {
      type: [String],
      default: [],
      validate: [(v) => Array.isArray(v) && v.length <= 10, "Maximum 10 images allowed"],
    },
    categoryPath: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    price: {
      type: Number,
      min: 0,
    },
    minPrice: { type: Number, min: 0, default: 0 },

    shipping: {
      type: {
        type: String,
        enum: ["standard", "express", "free"],
        default: "standard",
      },
      cost: { type: Number, default: 0, min: 0 },
    },
    variants: {
      type: [VariantSchema],
      required: true,

    },
    shortIdentifier: { type: String, unique: true, sparse: true },
    tags: { type: [String], default: [] },
    specs: { type: Map, of: String, default: {} },
    metrics: {
      views: { type: Number, default: 0, min: 0 },
      sold: { type: Number, default: 0, min: 0 },
      score: { type: Number, default: 0, min: 0, max: 5 },
      reviewsCount: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "deleted", "active", "inactive", "draft"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


/* === HOOKS === */
productSchema.pre("save", async function () {
  this.variants.forEach((v) => {
    v.finalPrice = calcFinalPrice(v.price, v.discount);
  });
  this.minPrice = computeMinPrice(this.variants);
  if (!this.shortIdentifier) {
    this.shortIdentifier = nanoid(8);
  }
  if (this.isModified("title") && this.title) {
    const cleanTitle = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    this.slug = `${cleanTitle}-${this.shortIdentifier}`;
  }
});

/* === INDEXES === */
productSchema.index({ status: 1, categoryPath: 1, minPrice: 1 });
productSchema.index({ "variants.sku": 1 }, { sparse: true });
productSchema.index({ tags: 1 });
productSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 2 }, name: "ProductTextIndex" }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);