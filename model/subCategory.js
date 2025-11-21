
const mongoose = require("mongoose");
import CategoryModel from "./category";
import SubSubCategoryModel from "./subSubCategory";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },
    parentID: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Category"
    },

    subCategories: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SubSubCategory",
            required: true
        }
    ],
},
    {
        timestamps: true,
    }
);

const SubCategoryModel = mongoose.models.SubCategory || mongoose.model("SubCategory", schema);

export default SubCategoryModel;

