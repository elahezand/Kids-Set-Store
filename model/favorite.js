import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }
    ],
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
    }
  }
);
const FavoriteModel = mongoose.models.Favorite || mongoose.model("Favorite", wishlistSchema);

export default FavoriteModel;
