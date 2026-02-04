
const mongoose = require("mongoose")

const schema = mongoose.Schema({
    phone: {
        type: "String",
        required: true
    },
    code: {
        type: "String",
        required: true
    },
    expTime: {
        type: Number,
        required: true
    },
    times: {
        type: Number,
        default: 0
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

const otpMOdal = mongoose.models.Otp || mongoose.model("Otp", schema)

export default otpMOdal