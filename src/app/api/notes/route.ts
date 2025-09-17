import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Note } from "@/models/Note";
import { Tenant } from "@/models/Tenant";
import { Types } from "mongoose";

const CreateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional().default(""),
  category: z.string().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const tenantId = new Types.ObjectId(user.tenantId);
  const notes = await Note.find({ tenantId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const body = await req.json();
  const { title, content, category } = CreateNoteSchema.parse(body);

  const tenantId = new Types.ObjectId(user.tenantId);
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  if (tenant.plan === "free") {
    const count = await Note.countDocuments({ tenantId });
    if (count >= 3) {
      return NextResponse.json({ error: "Free plan limit reached" }, { status: 402 });
    }
  }

  const created = await Note.create({
    title,
    content,
    tenantId,
    createdBy: new Types.ObjectId(user.userId),
    createdByEmail: user.email,
    category,
  });
  return NextResponse.json({ note: created }, { status: 201 });
}


