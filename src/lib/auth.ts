// import jwt from "jsonwebtoken";
// import { NextRequest } from "next/server";
// import { Types } from "mongoose";

// export type JwtUser = {
//   userId: string;
//   tenantId: string;
//   role: "admin" | "member";
//   email: string;
// };

// const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// export function signJwt(payload: JwtUser): string {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// export function verifyJwt(token: string): JwtUser | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as JwtUser;
//   } catch {
//     return null;
//   }
// }

// export function getAuthUser(req: NextRequest): JwtUser | null {
//   const authHeader = req.headers.get("authorization");
//   if (!authHeader) return null;
//   const [, token] = authHeader.split(" ");
//   if (!token) return null;
//   return verifyJwt(token);
// }

// export function ensureObjectId(id: string): Types.ObjectId {
//   return new Types.ObjectId(id);
// }

import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { Types } from "mongoose";

export type JwtUser = {
  userId: string;
  tenantId: string;
  role: "admin" | "member";
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export function signJwt(payload: JwtUser): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): JwtUser | null {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & JwtUser;
    
    // Ensure all required fields are present
    if (!decoded.userId || !decoded.tenantId || !decoded.role || !decoded.email) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      email: decoded.email,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function getAuthUser(req: NextRequest): JwtUser | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  
  const token = parts[1];
  if (!token) return null;
  
  return verifyJwt(token);
}

export function ensureObjectId(id: string): Types.ObjectId {
  try {
    return new Types.ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}