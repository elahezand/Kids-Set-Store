import mongoose from "mongoose";

const { Schema, Types } = mongoose;

export const CONTACT_STATUS = Object.freeze({
  NEW: "new", 
  READ: "read", 
  ANSWERED: "answered",
  ARCHIVED: "archived",
  SPAM: "spam",
});

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

const contactSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", default: null },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: null },

    body: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: Object.values(CONTACT_STATUS),
      default: CONTACT_STATUS.NEW,
    },

    // Admin side
    readAt: { type: Date, default: null },
    answeredAt: { type: Date, default: null },
    handledBy: { type: Types.ObjectId, ref: "User", default: null },
    adminNote: { type: String, trim: true, default: null }, // private, never shown to the sender
    answer: { type: String, trim: true, default: null },
    answeredBy: { type: Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ user: 1, createdAt: -1 });

const ContactModel = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default ContactModel;