import mongoose from "mongoose";
import CategoryModel from "./category";

const MAX_CATEGORY_DEPTH = 10;

const toJSONTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

const cleanList = (arr) =>
  Array.isArray(arr)
    ? [...new Set(arr.map((value) => String(value).trim()).filter(Boolean))]
    : [];

const round = (value) => Math.round(value * 100) / 100;

const calcFinalPrice = (price, discountPercent = 0) =>
  round(price * (1 - (discountPercent || 0) / 100));

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice: { type: Number, min: 0 },

    shortDescription: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true },
    color: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    img: { type: String, trim: true },
    tags: { type: [String], required: true, set: cleanList },
    availableSizes: { type: [String], default: [], set: cleanList },
    isAvailable: { type: Boolean, default: true },

    categoryPath: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      required: true,
    },

    score: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: toJSONTransform },
    toObject: { virtuals: true, transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

productSchema.index({ categoryPath: 1, createdAt: -1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ discountPercent: -1 });
productSchema.index({ score: -1 });

/* ---------- Virtuals ---------- */

productSchema.virtual("category").get(function () {
  return this.categoryPath?.at(-1) ?? null;
});

/* ---------- Category path ---------- */

const buildCategoryPath = async (categoryId) => {
  if (!categoryId) return [];

  const path = [];
  let currentId = categoryId;

  while (currentId && path.length < MAX_CATEGORY_DEPTH) {
    const category = await CategoryModel.findById(currentId).select("parentId").lean();

    if (!category) break;

    path.unshift(category._id);
    currentId = category.parentId;
  }

  if (!path.length) {
    throw new Error("Category not found");
  }

  return path;
};

const lastItem = (path) => (Array.isArray(path) ? path.at(-1) : path);

/* ---------- Hooks: create() / save() ---------- */

productSchema.pre("save", async function () {
  if (this.isNew || this.isModified("categoryPath")) {
    this.categoryPath = await buildCategoryPath(lastItem(this.categoryPath));
  }

  if (this.isNew || this.isModified("price") || this.isModified("discountPercent")) {
    this.finalPrice = calcFinalPrice(this.price, this.discountPercent);
  }
});

/* ---------- Hooks: findByIdAndUpdate / findOneAndUpdate / updateOne ---------- */

const syncOnUpdate = async function () {
  const update = this.getUpdate() || {};
  const set = { ...(update.$set || {}) };
  const rest = { ...update };
  delete rest.$set;

  const read = (key) => set[key] ?? rest[key];
  const path = read("categoryPath");
  if (path !== undefined) {
    delete rest.categoryPath;
    set.categoryPath = await buildCategoryPath(lastItem(path));
  }
  const newPrice = read("price");
  const newDiscount = read("discountPercent");

  if (newPrice !== undefined || newDiscount !== undefined) {
    const current = await this.model
      .findOne(this.getQuery())
      .select("price discountPercent")
      .lean();

    if (current) {
      set.finalPrice = calcFinalPrice(
        newPrice ?? current.price,
        newDiscount ?? current.discountPercent
      );
    }
  }

  this.setUpdate({ ...rest, $set: set });
};

productSchema.pre("findOneAndUpdate", syncOnUpdate);
productSchema.pre("updateOne", syncOnUpdate);

const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;