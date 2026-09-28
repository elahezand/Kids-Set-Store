const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
    },

    phone: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    logo: { type: String, required: true, trim: true },

    address: { type: String, default: "" },

    socials: {
      instagram: { type: String, default: "" },
      telegram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Info = mongoose.models.Info || mongoose.model("Info", schema);
module.exports = Info