import { NextRequest, NextResponse } from "next/server";
// dynamic import for server-only crypto
import { connectToDatabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectToDatabase();
  const { slug } = await params;
  const tenant = await Tenant.findOne({ _id: user.tenantId, slug });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const body = await req.json();
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body?.role === "admin" ? "admin" : "member";
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash("password", 10);
  const created = await User.create({ email, role, tenantId: tenant._id, passwordHash });

  // Optional email invite via Resend API if key present
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "invites@notes-saas.app",
          to: [email],
          subject: `${tenant.name} invited you to Notes SaaS`,
          html: `<p>You have been invited to <strong>${tenant.name}</strong>.</p>
                 <p>Login with email: <strong>${email}</strong> and temporary password: <strong>password</strong>.</p>`,
        }),
      });
    }
  } catch (e) {
    console.warn("Invite email send failed", e);
  }

  return NextResponse.json({ user: { id: created._id, email: created.email, role: created.role } }, { status: 201 });
}


