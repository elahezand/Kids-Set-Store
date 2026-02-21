const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "User",
        },
        department: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Department",
        },
        subDepartment: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "subDepartment",
        },
        priority: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        parent: {
            type: mongoose.Types.ObjectId,
            required: false,
            ref: "Ticket",
        },
        isAnswer: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

const ticketModel =
    mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

module.exports = ticketModel;

