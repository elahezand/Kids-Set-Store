import commentModel from "./comment";
import FavoriteModel from "./favorite";
const mongoose = require("mongoose")
const schema = mongoose.Schema({
    username: {
        type: String,
        default: "User Set-Kids"
    },
    phone: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: false

    },
    password: {
        type: String,
        required: false
    },

    role: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },

    refreshToken: {
        type: String,
    },
    resetCode: { type: String, required: false },
    resetCodeExpire: { type: Date, required: false },
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

schema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "userID"
});

schema.virtual("favorites", {
    ref: "Favorite",
    localField: "_id",
    foreignField: "userID"
});

schema.virtual("tickets", {
    ref: "Ticket",
    localField: "_id",
    foreignField: "userID"
});

const UserModel = mongoose.models.User || mongoose.model("User", schema)

export default UserModel