const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        subDepartment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subDepartment",
            required: true,
        },

        priority: {
            type: Number,
            required: true,
            min: 1,
            max: 3,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            default: null,
            index: true,
        },

        isAnswer: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,

        toObject: {
            virtuals: true,
        },

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

// Indexes

ticketSchema.index({ user: 1, createdAt: -1 });

ticketSchema.index({
    department: 1,
    subDepartment: 1,
});

ticketSchema.index({
    parent: 1,
    createdAt: 1,
});

ticketSchema.index({ createdAt: -1 });

// Model

const ticketModel =
    mongoose.models.Ticket ||
    mongoose.model("Ticket", ticketSchema);

module.exports = ticketModel;