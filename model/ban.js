import UserModal from "./user";
const mongoose = require("mongoose")
const schema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "USER",
        required: true
    },

    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    }
},
    {
        timestamps: true
    });


const BanModal = mongoose.models.Ban || mongoose.model("Ban", schema)

export default BanModal