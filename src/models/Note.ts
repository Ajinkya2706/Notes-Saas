import mongoose, { Schema, Document, Model } from "mongoose";

export interface NoteDocument extends Document {
  title: string;
  content: string;
  tenantId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdByEmail?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<NoteDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByEmail: { type: String },
    category: { type: String, index: true },
  },
  { timestamps: true }
);

NoteSchema.index({ tenantId: 1, createdAt: -1 });

export const Note: Model<NoteDocument> =
  (mongoose.models.Note as Model<NoteDocument>) ||
  mongoose.model<NoteDocument>("Note", NoteSchema);



