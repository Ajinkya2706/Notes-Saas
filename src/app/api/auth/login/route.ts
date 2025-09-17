import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// dynamic import for server-only crypto
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { signJwt } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    console.log("Login attempt started");
    const json = await req.json();
    console.log("Request body parsed:", { email: json.email });
    
    const { email, password } = LoginSchema.parse(json);
    console.log("Validation passed for:", email);

    await connectToDatabase();
    console.log("Database connected");

    const user = await User.findOne({ email }).lean();
    console.log("User found:", user ? "Yes" : "No");
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    console.log("User data:", { email: user.email, hasPasswordHash: !!user.passwordHash });
    if (!user.passwordHash) {
      return NextResponse.json({ error: "User data corrupted. Please re-seed database." }, { status: 500 });
    }

    const { compare } = await import("bcryptjs");
    const valid = await compare(password, user.passwordHash);
    console.log("Password valid:", valid);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const tenant = await Tenant.findById(user.tenantId).lean();
    console.log("Tenant found:", tenant ? "Yes" : "No");
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    const token = signJwt({
      userId: String(user._id),
      tenantId: String(user.tenantId),
      role: user.role,
      email: user.email,
    });
    console.log("JWT token generated");

    return NextResponse.json({ 
      token, 
      role: user.role, 
      tenant: { slug: tenant.slug, plan: tenant.plan, name: tenant.name } 
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    if (typeof err === "object" && err !== null && "name" in err && (err as { name?: unknown }).name === "ZodError" && "flatten" in err) {
      const e = err as { flatten: () => unknown };
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    const hasMsg = (e: unknown): e is { message: string } => typeof e === "object" && e !== null && "message" in e && typeof (e as { message?: unknown }).message === "string";
    const msg = hasMsg(err) ? err.message : "Unknown error";
    return NextResponse.json({ error: `Internal server error: ${msg}` }, { status: 500 });
  }
}


