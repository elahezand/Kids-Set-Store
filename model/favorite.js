const mongoose = require("mongoose");
import UserModal from "./user";
import ProductModal from "./product";

const schema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
  
},
    {
    timestamps: true,
  }
);

const FavoriteModel = mongoose.models.Favorite || mongoose.model("Favorite", schema);

export default FavoriteModel;
