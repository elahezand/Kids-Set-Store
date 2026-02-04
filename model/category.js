const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
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

const CategoryModel = mongoose.models.Category || mongoose.model("Category", schema);

export default CategoryModel;


