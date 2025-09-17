// seed.js - ES Module version
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/db.ts";
import { Tenant } from "../models/Tenant.ts";
import { User } from "../models/User.ts";

async function run() {
  try {
    await connectToDatabase();
    console.log(" Connected to database");

    // Create tenants with upsert
    await Tenant.bulkWrite([
      { 
        updateOne: { 
          filter: { slug: "acme" }, 
          update: { $setOnInsert: { name: "Acme Corp", slug: "acme", plan: "free" } }, 
          upsert: true 
        } 
      },
      { 
        updateOne: { 
          filter: { slug: "globex" }, 
          update: { $setOnInsert: { name: "Globex Corporation", slug: "globex", plan: "free" } }, 
          upsert: true 
        } 
      }
    ]);

    // Find the created tenants
    const acme = await Tenant.findOne({ slug: "acme" });
    const globex = await Tenant.findOne({ slug: "globex" });

    if (!acme || !globex) {
      throw new Error("Failed to create tenants");
    }

    console.log(" Tenants created/found");

    // Hash password
    const passwordHash = await bcrypt.hash("password", 10);

    // Create users
    const users = [
      { email: "admin@acme.test", role: "admin", tenantId: acme._id },
      { email: "user@acme.test", role: "member", tenantId: acme._id },
      { email: "admin@globex.test", role: "admin", tenantId: globex._id },
      { email: "user@globex.test", role: "member", tenantId: globex._id },
    ];

    for (const user of users) {
      await User.updateOne(
        { email: user.email },
        { 
          $setOnInsert: { 
            email: user.email, 
            role: user.role, 
            tenantId: user.tenantId, 
            password: passwordHash 
          } 
        },
        { upsert: true }
      );
    }

    console.log(" Seed complete - Test accounts created:");
    console.log("- admin@acme.test (password: password)");
    console.log("- user@acme.test (password: password)");
    console.log("- admin@globex.test (password: password)");
    console.log("- user@globex.test (password: password)");
    
  } catch (error) {
    console.error(" Seeding failed:", error);
    throw error;
  }
}

run()
  .then(() => {
    console.log(" Seeding finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error(" Seeding failed:", error.message);
    process.exit(1);
  });