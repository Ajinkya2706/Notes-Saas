import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Tenant } from "@/models/Tenant";

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const { slug } = await params;
  const tenant = await Tenant.findOneAndUpdate({ slug, _id: user.tenantId }, { $set: { plan: "pro" } }, { new: true });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  return NextResponse.json({ tenant: { slug: tenant.slug, plan: tenant.plan, name: tenant.name } });
}


