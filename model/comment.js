const mongoose = require("mongoose");
import ProductModal from "./product";
import UserModal from "./user";

const schema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false,
    },

    username: {
        type: String,
        required: true,
    },


    body: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    isAccept: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Date,
        default: () => Date.now(),
        immutable: false,
    },
    isAccept: {
        type: Boolean,
        default: false,
        required: true
    },
    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    answer: {
        type: String,
        required: false,
    }
});

const commentModel = mongoose.models.Comment || mongoose.model("Comment", schema);

export default commentModel;
