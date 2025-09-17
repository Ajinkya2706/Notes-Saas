import { NextResponse } from 'next/server';
// dynamic import for server-only crypto
import { connectToDatabase } from "@/lib/db";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create tenants
    const acme = await Tenant.create({ name: "Acme Corp", slug: "acme", plan: "free" });
    const globex = await Tenant.create({ name: "Globex Corporation", slug: "globex", plan: "free" });
    
    const { hash } = await import("bcryptjs");
    const passwordHash = await hash("password", 10);

    const users = [
      { email: "admin@acme.test", role: "admin", tenantId: acme._id, passwordHash },
      { email: "user@acme.test", role: "member", tenantId: acme._id, passwordHash },
      { email: "admin@globex.test", role: "admin", tenantId: globex._id, passwordHash },
      { email: "user@globex.test", role: "member", tenantId: globex._id, passwordHash },
    ];

    await User.insertMany(users);

    return NextResponse.json({ message: "Seed complete", users: users.map(u => u.email) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}