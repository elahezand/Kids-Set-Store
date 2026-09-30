const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const commentSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    parentId: {
      type: Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
      index: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    pros: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((v) => String(v).trim()).filter(Boolean))]
          : [],
    },

    cons: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((v) => String(v).trim()).filter(Boolean))]
          : [],
    },

    recommendation: {
      type: String,
      enum: ["recommended", "not_recommended", "no_idea"],
      default: "no_idea",
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam", "deleted"],
      default: "pending",
      index: true,
    },

    moderation: {
      moderatedBy: {
        type: Types.ObjectId,
        ref: "User",
        default: null,
      },
      moderatedAt: {
        type: Date,
        default: null,
      },
      rejectReason: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
    },

    verifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

commentSchema.index({ product: 1, status: 1, parentId: 1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, createdAt: 1 });

commentSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { parentId: null, deletedAt: null } }
);

async function syncProductScore(productId) {
  if (!productId) return;

  const [agg] = await Comment.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
        parentId: null,
        rating: { $ne: null },
      },
    },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const score = agg ? Math.round(agg.avgRating * 10) / 10 : 0;
  const reviewsCount = agg ? agg.count : 0;

  const Product = mongoose.model("Product");
  await Product.findByIdAndUpdate(productId, {
    "metrics.score": score,
    "metrics.reviewsCount": reviewsCount,
  });
}

commentSchema.post("save", async function () {
  try {
    await syncProductScore(this.product);
  } catch (error) {
    console.error("Error syncing product score:", error);
  }
});
commentSchema.post("findOneAndUpdate", async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await syncProductScore(doc.product);
  }
});
commentSchema.post("updateOne", async function () {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await syncProductScore(doc.product);
  }
});

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
Comment.syncProductScore = syncProductScore;
module.exports = Comment;