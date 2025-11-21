
const mongoose = require("mongoose");
import CategoryModel from "./category";
import SubCategoryModel from "./subCategory";

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

    subParent: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "SubCategory"
    }

},
    {
        timestamps: true,
    }
);

const SubSubCategoryModel = mongoose.models.SubSubCategory || mongoose.model("SubSubCategory", schema);

export default SubSubCategoryModel;

