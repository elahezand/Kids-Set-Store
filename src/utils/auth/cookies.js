import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from "@/utils/auth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const setAuthCookies = (response, { accessToken, refreshToken }, { remember = true } = {}) => {
  if (accessToken) {
    response.cookies.set("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  if (refreshToken) {
    response.cookies.set("refreshToken", refreshToken, {
      ...cookieOptions,
      ...(remember ? { maxAge: REFRESH_TOKEN_TTL_SECONDS } : {}),
    });
  }
};

const clearAuthCookies = (response) => {
  response.cookies.set("accessToken", "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set("refreshToken", "", { ...cookieOptions, maxAge: 0 });
};

const authCookies = {
  cookieOptions,
  setAuthCookies,
  clearAuthCookies,
};

export default authCookies;
