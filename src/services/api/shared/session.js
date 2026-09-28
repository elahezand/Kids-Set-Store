const mongoose = require("mongoose")
import Session from "../../../../model/session";
const redisClient = require("../../redis");
const logger = require("../../utils/logger");
const {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareTokenHash,
} = require("../../utils/auth");


const ROTATION_GRACE_MS = 30 * 1000;
const revokedKey = (sid) => `session:revoked:${sid}`;

async function markRevokedInCache(sessionIds) {
  try {
    await Promise.all(
      sessionIds.map((sid) =>
        redisClient.set(revokedKey(String(sid)), "1", { EX: ACCESS_TOKEN_TTL_SECONDS })
      )
    );
  } catch (err) {
    logger.error("[session] could not cache revoked session ids:", err);
  }
}

async function isSessionRevoked(sid) {
  if (!sid || !mongoose.Types.ObjectId.isValid(sid)) return true;
  try {
    if (await redisClient.exists(revokedKey(String(sid)))) return true;
    return false;
  } catch (err) {
    const active = await Session.exists({
      _id: sid,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    return !active;
  }
}

function clientInfo(req) {
  return {
    userAgent: String(req.get?.("user-agent") || "").slice(0, 500),
    ip: req.ip || req.socket?.remoteAddress || "",
  };
}

async function issueTokens(user, sessionId) {
  const accessToken = await generateToken({ id: user._id, sid: sessionId });
  const refreshToken = await generateRefreshToken({ id: user._id, sid: sessionId });
  return { accessToken, refreshToken };
}

/* === LOGIN: new session for this device === */
async function createSession(user, req) {
  const session = new Session({
    user: user._id,
    tokenHash: "pending",
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    ...clientInfo(req),
  });

  const tokens = await issueTokens(user, session._id);
  session.tokenHash = hashToken(tokens.refreshToken);
  await session.save();

  return { session, ...tokens };
}

/*=== REFRESH ===*/
async function rotateSession(refreshToken, req) {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload?.sid || !payload?.id) return { ok: false, reason: "invalid_token" };

  const session = await Session.findById(payload.sid);
  if (!session || String(session.user) !== String(payload.id)) {
    return { ok: false, reason: "session_not_found" };
  }
  if (!session.isActive()) return { ok: false, reason: "session_inactive" };

  const user = { _id: session.user };

  // 1) Current token → rotate
  if (compareTokenHash(refreshToken, session.tokenHash)) {
    const tokens = await issueTokens(user, session._id);
    session.previousTokenHash = session.tokenHash;
    session.tokenHash = hashToken(tokens.refreshToken);
    session.rotatedAt = new Date();
    session.lastUsedAt = new Date();
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const info = clientInfo(req);
    if (info.ip) session.ip = info.ip;
    await session.save();
    return { ok: true, ...tokens };
  }

  // 2) Previous token, only moments after rotation → parallel request from another tab
  const inGrace =
    session.rotatedAt && Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS;
  if (inGrace && compareTokenHash(refreshToken, session.previousTokenHash)) {
    const accessToken = await generateToken({ id: session.user, sid: session._id });
    return { ok: true, accessToken, refreshToken: null };
  }

  // 3) Anything else is an old / stolen refresh token → kill the session
  logger.warn(`[session] refresh token reuse detected, revoking session ${session._id}`);
  await revokeSession(session._id, "reuse_detected");
  return { ok: false, reason: "reuse_detected" };
}

/* === REVOKE ONE === */
async function revokeSession(sessionId, reason = "logout") {
  if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) return false;
  const res = await Session.updateOne(
    { _id: sessionId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  );
  await markRevokedInCache([sessionId]);
  return res.modifiedCount > 0;
}

/* === REVOKE ALL OF A USER (optionally keep the current one) === */
async function revokeAllUserSessions(userId, reason = "logout_all", { exceptSessionId = null } = {}) {
  const filter = { user: userId, revokedAt: null };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };

  const sessions = await Session.find(filter).select("_id").lean();
  if (!sessions.length) return 0;

  const ids = sessions.map((s) => s._id);
  await Session.updateMany(
    { _id: { $in: ids } },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  );
  await markRevokedInCache(ids);
  return ids.length;
}

/* === LIST ACTIVE SESSIONS (for "active devices" in settings) === */
async function listActiveSessions(userId, currentSessionId) {
  const sessions = await Session.find({
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select("userAgent ip createdAt lastUsedAt expiresAt")
    .sort({ lastUsedAt: -1 })
    .lean();

  return sessions.map((s) => ({
    ...s,
    isCurrent: String(s._id) === String(currentSessionId),
  }));
}
export {
  createSession,
  rotateSession,
  revokeSession,
  revokeAllUserSessions,
  listActiveSessions,
  isSessionRevoked,
};