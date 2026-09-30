const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true }, // unique index below
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

articleSchema.index({ isPublished: 1, createdAt: -1 });
articleSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);


const Article =
  mongoose.models.Article || mongoose.model("Article", articleSchema);

module.exports = Article;
