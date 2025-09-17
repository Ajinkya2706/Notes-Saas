import mongoose, { Schema, Document, Model } from "mongoose";

export type Plan = "free" | "pro";

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<TenantDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    plan: { type: String, enum: ["free", "pro"], default: "free", index: true },
  },
  { timestamps: true }
);

export const Tenant: Model<TenantDocument> =
  (mongoose.models.Tenant as Model<TenantDocument>) ||
  mongoose.model<TenantDocument>("Tenant", TenantSchema);



