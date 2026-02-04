const mongoose = require("mongoose");
import UserModal from "./user";
import DepartmentModel from "./department";
import SubDepartmentModel from "./subDepartment";

const schema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    subject: {
        type: String,
        required: true,
    },

    message: [
        {
            senderID: {
                type: mongoose.Types.ObjectId,
                ref: "User",
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    priority: {
        type: Number,
        required: false,
        default: 1,
        enum: [1, 2, 3]
    },

    status: {
        type: String,
        required: false,
        default: "open",
        enum: ["open", "close", "pending"]
    },


    answerBy: {
        type: String,
        required: true,
        default: "USER",
        enum: ["ADMIN", "USER"]
    },

    department: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    subDepartment: {
        type: mongoose.Types.ObjectId,
        ref: "SubDepartment",
        required: true,
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

const TicketModel = mongoose.models.Ticket || mongoose.model("Ticket", schema);

export default TicketModel;
