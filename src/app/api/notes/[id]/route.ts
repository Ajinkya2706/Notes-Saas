import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Note } from "@/models/Note";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  category: z.string().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(_req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const tenantId = new Types.ObjectId(user.tenantId);
  const { id } = await params;
  const note = await Note.findOne({ _id: id, tenantId }).lean();
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const tenantId = new Types.ObjectId(user.tenantId);
  const body = await req.json();
  const update = UpdateSchema.parse(body);
  const { id } = await params;
  const note = await Note.findOneAndUpdate({ _id: id, tenantId }, { $set: update }, { new: true });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const tenantId = new Types.ObjectId(user.tenantId);
  const { id } = await params;
  const deleted = await Note.findOneAndDelete({ _id: id, tenantId });
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}


