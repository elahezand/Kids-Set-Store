import mongoose from "mongoose";

const toJSONTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  return ret;
};

const banSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phone: { type: String, trim: true, default: null },
    email: { type: String, trim: true, lowercase: true, default: null },

    reason: { type: String, trim: true, default: "" },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: toJSONTransform },
    toObject: { virtuals: true, transform: toJSONTransform },
  }
);

/* ---------- Indexes ---------- */

banSchema.index({ user: 1 }, { unique: true });

// Fast lookup on login / register
banSchema.index({ phone: 1 }, { sparse: true });
banSchema.index({ email: 1 }, { sparse: true });

banSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ---------- Statics ---------- */

banSchema.statics.findActiveBan = function ({ userId, phone, email } = {}) {
  const or = [];

  if (userId) or.push({ user: userId });
  if (phone) or.push({ phone: String(phone).trim() });
  if (email) or.push({ email: String(email).trim().toLowerCase() });

  if (!or.length) return Promise.resolve(null);

  return this.findOne({
    $or: or,
    $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }],
  }).lean();
};

banSchema.statics.isBanned = async function (identifiers) {
  return Boolean(await this.findActiveBan(identifiers));
};

const BanModel = mongoose.models.Ban || mongoose.model("Ban", banSchema);

export default BanModel;