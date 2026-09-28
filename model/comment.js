import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const cleanList = (arr) =>
  Array.isArray(arr)
    ? [...new Set(arr.map((value) => String(value).trim()).filter(Boolean))]
    : [];

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

const commentSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    parentId: { type: Types.ObjectId, ref: "Comment", default: null },
    rating: { type: Number, min: 1, max: 5, default: null },

    body: { type: String, required: true, trim: true, minlength: 3, maxlength: 2000 },

    pros: { type: [String], default: [], set: cleanList },
    cons: { type: [String], default: [], set: cleanList },

    recommendation: {
      type: String,
      enum: ["recommended", "not_recommended", "no_idea"],
      default: "no_idea",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam", "deleted"],
      default: "pending",
    },
    moderation: {
      moderatedBy: { type: Types.ObjectId, ref: "User", default: null },
      moderatedAt: { type: Date, default: null },
      reason: { type: String, trim: true, maxlength: 500, default: null },
    },

    verifiedPurchase: { type: Boolean, default: false },

    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */
commentSchema.index({ productId: 1, parentId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ status: 1, createdAt: -1 });
commentSchema.index(
  { user: 1, productId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      parentId: { $type: "null" },
      deletedAt: { $type: "null" },
    },
  }
);

// model/comment.js
commentSchema.statics.attachReplies = async function (reviews = []) {
  if (!reviews.length) return [];

  const replies = await this.find({
    parentId: { $in: reviews.map((review) => review._id) },
    status: "approved",
    deletedAt: null,
  })
    .sort({ createdAt: 1 })
    .populate("user", "name username")
    .lean();

  const byParent = new Map();
  for (const reply of replies) {
    const key = String(reply.parentId);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(reply);
  }

  return reviews.map((review) => {
    const plain = typeof review.toObject === "function" ? review.toObject() : review;
    return { ...plain, replies: byParent.get(String(review._id)) || [] };
  });
};
/* ---------- Product score ---------- */

async function syncProductScore(productId) {
  if (!productId) return;

  const [agg] = await Comment.aggregate([
    {
      $match: {
        productId: new Types.ObjectId(productId),
        parentId: null,
        status: "approved",
        deletedAt: null,
        rating: { $ne: null },
      },
    },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const Product = mongoose.model("Product");

  await Product.findByIdAndUpdate(productId, {
    score: agg ? Math.round(agg.avgRating * 10) / 10 : 0,
    ratingCount: agg?.count ?? 0,
  });
}

const safeSync = async (productId) => {
  try {
    await syncProductScore(productId);
  } catch (error) {
    console.error("Error syncing product score:", error);
  }
};

/* ---------- Hooks ---------- */

commentSchema.pre("save", function () {
  if (!this.isNew && this.isModified("body")) {
    this.editedAt = new Date();
  }
});

commentSchema.post("save", async function (doc) {
  if (!doc.parentId) await safeSync(doc.productId);
});

const syncFromDoc = async (doc) => {
  if (doc && !doc.parentId) await safeSync(doc.productId);
};

commentSchema.post("findOneAndUpdate", syncFromDoc);
commentSchema.post("findOneAndDelete", syncFromDoc);

commentSchema.post("updateOne", { document: false, query: true }, async function () {
  const doc = await this.model
    .findOne(this.getQuery())
    .select("productId parentId")
    .lean();

  await syncFromDoc(doc);
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;