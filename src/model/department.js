import mongoose from "mongoose";

const toJSONTransform = (doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  return ret;
};

const departmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { transform: toJSONTransform },
    toObject: { transform: toJSONTransform },
  }
);

departmentSchema.index({ title: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

departmentSchema.index({ isActive: 1, order: 1 });

const DepartmentModel = mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default DepartmentModel;
