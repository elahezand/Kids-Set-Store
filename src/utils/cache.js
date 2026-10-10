import redisClient from "@/configs/redis";
import logger from "@/utils/logger";

const PREFIX = "cache:";

export const CACHE_KEYS = Object.freeze({
  categories: `${PREFIX}categories:tree`,
  info: `${PREFIX}info:main`,
  stats: `${PREFIX}stats:public`,
  products: `${PREFIX}products`,
});

export const remember = async (key, ttlSeconds, compute) => {
  try {
    const cached = await redisClient.get(key);
    if (cached !== null && cached !== undefined) return JSON.parse(cached);
  } catch (error) {
    logger.warn("[cache] read failed:", key, error?.message);
  }

  const value = await compute();

  try {
    if (value !== undefined) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    }
  } catch (error) {
    logger.warn("[cache] write failed:", key, error?.message);
  }

  return value;
};

const invalidateCache = async (...patterns) => {
  const list = patterns.flat().filter(Boolean);
  if (!list.length) return;

  try {
    for (const raw of list) {
      const pattern = raw.startsWith("/api/products") ? `${CACHE_KEYS.products}*` : raw;

      if (!pattern.includes("*")) {
        await redisClient.del(pattern);
        continue;
      }

      for await (const key of redisClient.scan(pattern)) {
        await redisClient.del(key);
      }
    }
  } catch (error) {
    logger.warn("[cache] invalidate failed:", error?.message);
  }
};

export default invalidateCache;
