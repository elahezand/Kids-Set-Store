const mongoose = require("mongoose");
const { Schema } = mongoose;
const { nanoid } = require("nanoid");
const notifyUser = require("../utils/notify");
const { calcFinalPrice, computeMinPrice, getOfferFinalPrices } = require("../utils/pricing");

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

const UnifiedListingSchema = new Schema(
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
      default: function () {
        return this.listingType === "user_ad" ? "pending" : "draft";
      },
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
UnifiedListingSchema.pre("save", async function () {
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
UnifiedListingSchema.index({ listingType: 1, status: 1, categoryPath: 1, minPrice: 1 });
UnifiedListingSchema.index({ owner: 1, status: 1 });
UnifiedListingSchema.index({ "variants.sku": 1 }, { sparse: true });
UnifiedListingSchema.index({ tags: 1 });
UnifiedListingSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 2 }, name: "ListingTextIndex" }
);

module.exports = mongoose.models.Listing || mongoose.model("Listing", UnifiedListingSchema);