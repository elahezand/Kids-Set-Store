import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const walletTransactionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Types.ObjectId, ref: "Order", default: null },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["spend", "refund"], required: true },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true, versionKey: false }
);

walletTransactionSchema.index(
  { order: 1, type: 1 },
  { unique: true, partialFilterExpression: { order: { $type: "objectId" } } }
);

export default mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", walletTransactionSchema);
