const environment = process.env.NODE_ENV;
let accessExpiry = process.env.ACCESS_TOKEN_EXPIRY;
let refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY;

// dev - 5 minutes | prod - 15 minutes
accessExpiry = Number.parseInt(accessExpiry) * 60;

if (environment === "development") {
  refreshExpiry = Number.parseInt(refreshExpiry) * 60; // 30 minutes
  // console.log(environment, accessExpiry, refreshExpiry);
} else if (environment === "production") {
  refreshExpiry = Number.parseInt(refreshExpiry) * 24 * 60 * 60; // 15 days
}

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: accessExpiry * 1000, // milliseconds
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: refreshExpiry * 1000, // milliseconds
};

module.exports = { accessCookieOptions, refreshCookieOptions };
