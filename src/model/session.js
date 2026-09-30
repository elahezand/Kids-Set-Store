const mongoose = require("mongoose");
const { Schema } = mongoose;
const sessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    tokenHash: { type: String, required: true },
    previousTokenHash: { type: String, default: null },
    rotatedAt: { type: Date, default: null },

    userAgent: { type: String, default: "", maxlength: 500 },
    ip: { type: String, default: "" },

    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    revokedAt: { type: Date, default: null },
    revokedReason: {
      type: String,
      enum: [null, "logout", "logout_all", "revoked_by_user", "reuse_detected", "banned", "user_deleted"],
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// MongoDB deletes the document once expiresAt has passed
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, revokedAt: 1 });

sessionSchema.methods.isActive = function () {
  return !this.revokedAt && this.expiresAt > new Date();
};

module.exports = mongoose.models.Session || mongoose.model("Session", sessionSchema);
