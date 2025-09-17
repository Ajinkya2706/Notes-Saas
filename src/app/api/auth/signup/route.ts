import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// dynamic import for server-only crypto
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().min(1),
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password, tenantSlug } = SignupSchema.parse(json);
    await connectToDatabase();

    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const { hash } = await import("bcryptjs");
    const passwordHash = await hash(password, 10);
    await User.create({ email, passwordHash, role: "member", tenantId: tenant._id });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "name" in err && (err as { name?: unknown }).name === "ZodError" && "flatten" in err) {
      const e = err as { flatten: () => unknown };
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



