import redisClient from "@/configs/redis";
import logger from "@/utils/logger";
import { jsonError } from "@/utils/apiResponse";

export const getClientIp = (request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
};

export const hitLimit = async (key, limit, windowSeconds) => {
  try {
    const redisKey = `rl:${key}`;
    const count = await redisClient.incr(redisKey);
    if (count === 1) await redisClient.expire(redisKey, windowSeconds);
    if (count <= limit) return null;
    const ttl = await redisClient.ttl(redisKey);
    return ttl > 0 ? ttl : windowSeconds;
  } catch (error) {
    logger.error(`rate limit check failed: ${error}`);
    return null;
  }
};

export const rateLimit = async (rules) => {
  for (const { key, limit, window } of rules) {
    const retryAfter = await hitLimit(key, limit, window);
    if (retryAfter) {
      const response = jsonError("Too many requests. Please try again later.", 429);
      response.headers.set("Retry-After", String(retryAfter));
      return response;
    }
  }
  return null;
};

export const clearLimit = async (key) => {
  try {
    await redisClient.del(`rl:${key}`);
  } catch (error) {
    logger.error(`rate limit reset failed: ${error}`);
  }
};
