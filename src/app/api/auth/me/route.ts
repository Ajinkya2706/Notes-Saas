import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Tenant } from "@/models/Tenant";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const tenant = await Tenant.findById(user.tenantId).lean();
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  return NextResponse.json({ role: user.role, tenant: { slug: tenant.slug, plan: tenant.plan, name: tenant.name } });
}

export async function OPTIONS() { return NextResponse.json({}, { status: 200 }); }


