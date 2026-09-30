import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

// Reuse one connection across hot reloads / serverless invocations.
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectToDB = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGO_URL) {
        throw new Error("MONGO_URL is not defined. Copy .env.example to .env and fill it in.");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGO_URL, { bufferCommands: false })
            .then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }
    return cached.conn;
};

export default connectToDB;
