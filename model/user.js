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

    refreshToken: {
        type: String,
    }
}, {
    timestamps: true
});

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



const UserModal = mongoose.models.User || mongoose.model("User", schema)

export default UserModal