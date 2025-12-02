
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    },

},
    {
        timestamps: true,
    }
);


const CategoryModel = mongoose.models.Category || mongoose.model("Category", schema);

export default CategoryModel;


