const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: Number.parseInt(process.env.ACCESS_TOKEN_EXPIRY) * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: Number.parseInt(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
};

module.exports = { accessCookieOptions, refreshCookieOptions };
