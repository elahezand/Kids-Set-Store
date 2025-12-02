const mongoose = require("mongoose");
import CategoryModel from "./category";
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    longDescription: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    material: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 5,
    },
    img: {
        type: String,
        required: false
    },
    tags: {
        type: [String],
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    availableSizes: [String],
    isAvailable: {
        type: Boolean,
        default: true,
    },
});
schema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "productID"
});


const ProductModal = mongoose.models.Product || mongoose.model("Product", schema)

export default ProductModal