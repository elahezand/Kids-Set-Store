import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true },
  address: { type: String, required: true, trim: true },
  state: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "User",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: /^09\d{9}$/,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
      select: false,
    },

    wallet: {
      balance: { type: Number, default: 0, min: 0 },
    },

    role: {
      type: [String],
      enum: ["USER", "ADMIN"],
      default: ["USER"],
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    profilePicture: {
      type: String,
      default: null,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },

    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
