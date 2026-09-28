import mongoose from "mongoose";
import slugify from "../validations/slugify";
const toJSONTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: { type: String, required: true, trim: true, lowercase: true },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: toJSONTransform },
    toObject: { virtuals: true, transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

categorySchema.index({ slug: 1 }, { unique: true });

// Fast "children of X" and "root categories" queries
categorySchema.index({ parentId: 1, name: 1 });

/* ---------- Hooks ---------- */

categorySchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

/* ---------- Virtuals ---------- */

// category.populate("children")
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

categorySchema.virtual("isRoot").get(function () {
  return !this.parentId;
});

/* ---------- Statics ---------- */

categorySchema.statics.findRoots = function () {
  return this.find({ parentId: null }).sort({ name: 1 }).lean();
};

categorySchema.statics.findChildren = function (parentId) {
  return this.find({ parentId }).sort({ name: 1 }).lean();
};


categorySchema.statics.getTree = async function () {
  const categories = await this.find().sort({ name: 1 }).lean();

  const nodes = new Map(
    categories.map((category) => [
      String(category._id),
      {
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        parentId: category.parentId ? String(category.parentId) : null,
        children: [],
      },
    ])
  );

  const tree = [];

  for (const node of nodes.values()) {
    const parent = node.parentId && nodes.get(node.parentId);
    (parent ? parent.children : tree).push(node);
  }

  return tree;
};

const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default CategoryModel;