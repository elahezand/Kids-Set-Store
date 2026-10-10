import { createClient } from "redis";
import logger from "@/utils/logger";
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});
if (process.env.NEXT_PHASE !== "phase-production-build") {
  redisClient.connect().catch((error) => logger.error(`can not connect to redis: ${error}`));
}
redisClient.on("connect", () => logger.info("connecting to redis"));
redisClient.on("error", (error) => logger.error(`can not connect to redis: ${error}`));
redisClient.on("ready", () => logger.info("redis is connect and ready to use"));

export default redisClient;
