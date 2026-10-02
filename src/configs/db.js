import mongoose from "mongoose";
import logger from "@/utils/logger";

const MONGO_URL = process.env.MONGO_URI || process.env.MONGO_URL;

// Next.js re-runs files on hot reload and per request: keep ONE connection per process
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null, sweeperStarted: false };

function startOrderSweeper() {
    if (cached.sweeperStarted) return;
    if (process.env.NEXT_PHASE === "phase-production-build") return;
    if (process.env.DISABLE_ORDER_SWEEPER === "true") return;
    cached.sweeperStarted = true;

    const everyMinutes = Number(process.env.ORDER_SWEEP_MINUTES || 10);

    const run = async () => {
        try {
            const { runOrderSweeps } = await import("@/services/server/shared/orderSweeper");
            const result = await runOrderSweeps();
            const total = result.finished + result.paid + result.cancelled + result.completed;
            if (total) logger.info(`order sweeper: ${JSON.stringify(result)}`);
        } catch (err) {
            logger.error(`order sweeper failed: ${err}`);
        }
    };

    run();
    setInterval(run, everyMinutes * 60 * 1000).unref();
    logger.info(`order sweeper every ${everyMinutes} minutes`);
}

const connectToDB = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGO_URL) {
        throw new Error("MONGO_URI is not defined in .env");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URL, { bufferCommands: false }).then((m) => {
            logger.info(`MongoDB Connected: ${m.connection.host}`);
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        logger.error(`ERROR in mongoose connection: ${err}`);
        cached.promise = null; // next request tries again
        throw err;
    }

    startOrderSweeper();
    return cached.conn;
};

export default connectToDB;