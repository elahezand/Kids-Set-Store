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
        default: 0
    },

    expTime: {
        type: String,
        required: true
    },

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

const DiscountModel = mongoose.models.Discount || mongoose.model("Discount", schema);

export default DiscountModel;
