const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const filterSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },

    type: {
      type: String,
      enum: ["select", "radio", "boolean", "text"],
      required: true,
    },

    options: {
      type: [optionSchema],
      default: [],
    },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },

    description: { type: String, default: "" },

    icon: {
      svgCode: { type: String, trim: true },
    },

    filters: {
      type: [filterSchema],
      default: [],
    },

    isActive: { type: Boolean, default: true },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);


categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  } else if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }
  next();
});

categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);