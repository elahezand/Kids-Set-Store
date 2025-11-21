const mongoose = require("mongoose");
import ProductModal from "./product";

const schema = new mongoose.Schema({
    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    percent: {
        type: Number,
        required: true,
    },
    maxUses: {
        type: Number,
        required: true,
    },
    uses: {
        type: Number,
        required: false,
        default:0
    },

    expTime: {
        type:String,
        required: true
    },

},
    {
        timestamps: true,
    }
);

const DiscountModel = mongoose.models.Discount || mongoose.model("Discount", schema);

export default DiscountModel;
