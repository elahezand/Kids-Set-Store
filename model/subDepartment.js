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

const SubDepartmentModel = mongoose.models.SubDepartment || mongoose.model("SubDepartment", schema);

export default SubDepartmentModel;
