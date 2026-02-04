const mongoose = require("mongoose");
import ProductModel from "./product";
const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
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
        min: 1,
        max: 5,
    },
    isAccept: {
        type: Boolean,
        default: false,
        required: true
    },

    body: {
        type: String,
        required: true,
    },

    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    answer: [
        {
            text: String,
            admin: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "USER"
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
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

const commentModel = mongoose.models.Comment || mongoose.model("Comment", schema);

export default commentModel;
