const mongoose = require("mongoose")
const schema = mongoose.Schema({
    phone: {
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

const Ban = mongoose.models.Ban || mongoose.model("Ban", schema)

module.exports = Ban;
