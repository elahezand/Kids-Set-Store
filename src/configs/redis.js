const redisDB = require("redis");
const logger = require("@/utils/logger");

const redisClient = redisDB.createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379
    },
});
redisClient.connect();
redisClient.on("connect", () => logger.info("connecting to redis"));
redisClient.on("error", (error) => logger.error(`can not connect to redis: ${error}`));
redisClient.on("ready", () => logger.info("redis is connect and ready to use"));

module.exports = redisClient
