
const mongoose = require("mongoose");
import SubCategoryModel from "./subCategory";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        required: true,
    },

    subCategories: [
        {
            type: mongoose.Types.ObjectId,
            ref: "SubCategory",
            required: false
        }
    ],
},
    {
        timestamps: true,
    }
);


const CategoryModel = mongoose.models.Category || mongoose.model("Category", schema);

export default CategoryModel;


