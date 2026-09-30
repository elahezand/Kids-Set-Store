const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const favoriteSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

favoriteSchema.index({ user: 1, productId: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;