const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

});

const DepartmentModel = mongoose.models.Department || mongoose.model("Department", schema);

export default DepartmentModel;
