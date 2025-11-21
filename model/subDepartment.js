const mongoose = require("mongoose");
import DepartmentModel from "./department";

const schema = new mongoose.Schema({
    department: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
        required: true
    },
    title: {
        type: String,
        required: true,
    },

});

const SubDepartmentModel = mongoose.models.SubDepartment || mongoose.model("SubDepartment", schema);

export default SubDepartmentModel;
