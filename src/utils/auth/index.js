const { hash, compare } = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");
const crypto = require("crypto");

const hashPassword = (password) => {
  return hash(password, 12);
};

const verifyPassword = (password, hashedPassword) => {
  return compare(password, hashedPassword);
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;            
const REFRESH_TOKEN_TTL_SECONDS = 15 * 24 * 60 * 60;

const generateToken = async (data) => {
  const token = await sign({ ...data }, process.env.ACCESS_TOKEN, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  })

  return token
}
const generateRefreshToken = async (data) => {
  const token = await sign({ ...data }, process.env.REFRESH_TOKEN, {
    algorithm: "HS256",
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    jwtid: crypto.randomUUID(),
  })

  return token
}

const verifyToken = async (token) => {
  try {
    return await verify(token, process.env.ACCESS_TOKEN)
  } catch (err) {
    return null
  }
}

const verifyRefreshToken = async (refreshToken) => {
  try {
    return await verify(refreshToken, process.env.REFRESH_TOKEN)
  } catch (err) {
    return null
  }
}


const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const compareTokenHash = (token, storedHash) => {
  if (!token || !storedHash) return false;
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(String(storedHash), "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

module.exports = {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  hashToken,
  compareTokenHash,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
};

