const environment = process.env.NODE_ENV;
let accessExpiry = process.env.ACCESS_TOKEN_EXPIRY;
let refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY;

// dev - 5 minutes | prod - 15 minutes
accessExpiry = Number.parseInt(accessExpiry) * 60;

if (environment === "development") {
  refreshExpiry = Number.parseInt(refreshExpiry) * 60; // 30 minutes
} else if (environment === "production") {
  refreshExpiry = Number.parseInt(refreshExpiry) * 24 * 60 * 60; // 15 days
}
// console.log(environment, accessExpiry, refreshExpiry);

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: accessExpiry * 1000, // milliseconds
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: refreshExpiry * 1000, // milliseconds
};

module.exports = { accessCookieOptions, refreshCookieOptions };
