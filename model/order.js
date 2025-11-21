const mongoose = require("mongoose");
import ProductModal from "./product";
import UserModal from "./user";

const schema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false,
    },
    date: {
        type: Date,
        default: () => Date.now(),
        immutable: false,
    },
    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
 
});

const orderModel = mongoose.models.Order || mongoose.model("Order", schema);

export default orderModel;
