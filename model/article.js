import mongoose from "mongoose";
import slugify from "../validations/slugify";
export const ARTICLE_STATUS = Object.freeze({
  PUBLISH: "publish",
  UNPUBLISH: "unpublish",
});

const toJSONTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shortDescription: { type: String, required: true, trim: true },
    cover: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.UNPUBLISH,
      index: true,
    },

    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: toJSONTransform },
    toObject: { virtuals: true, transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */
articleSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);

articleSchema.index({ status: 1, publishedAt: -1 });

/* ---------- Hooks ---------- */

articleSchema.pre("save", function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (this.isModified("status")) {
    this.publishedAt =
      this.status === ARTICLE_STATUS.PUBLISH ? this.publishedAt ?? new Date() : null;
  }
});

/* ---------- Statics ---------- */

articleSchema.statics.findPublished = function (filter = {}) {
  return this.find({ ...filter, status: ARTICLE_STATUS.PUBLISH }).sort({
    publishedAt: -1,
  });
};

const ArticleModel =
  mongoose.models.Article || mongoose.model("Article", articleSchema);

export default ArticleModel;