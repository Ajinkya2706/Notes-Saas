import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  // In Vercel/serverless logs, make it clear why connection fails
  console.warn("MONGODB_URI env var is missing");
}

const globalWithMongoose = global as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!globalWithMongoose.mongooseConn) {
    globalWithMongoose.mongooseConn = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((conn) => {
        return conn;
      })
      .catch((error) => {
        console.error("Mongo connection error", error);
        throw error;
      });
  }
  return globalWithMongoose.mongooseConn;
}



