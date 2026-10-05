const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    msg: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
    see: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: [
        "manual",
        "order_status",
        "product_approved",
        "product_rejected",
        "cod_overdue",
        "cod_received",
        "order_shipped",
        "delivery_update",
      ],
      default: "manual",
    },
    link: {
      type: String,
      default: null,
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

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = Notification;