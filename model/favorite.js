import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

const favoriteSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },

    products: {
      type: [{ type: Types.ObjectId, ref: "Product" }],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

// One wishlist per user
favoriteSchema.index({ user: 1 }, { unique: true });

// "How many users liked this product?"
favoriteSchema.index({ products: 1 });

const FavoriteModel = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);

export default FavoriteModel;