const environment = process.env.NODE_ENV;
let accessExpiry = process.env.ACCESS_TOKEN_EXPIRY;
let refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY;

const isProduction = environment === "production";

// Convert expiry to seconds
accessExpiry = Number.parseInt(accessExpiry) * 60;

if (!isProduction) {
  // non-prod environment
  refreshExpiry = Number.parseInt(refreshExpiry) * 60; // 30 minutes
} else {
  // prod environment
  refreshExpiry = Number.parseInt(refreshExpiry) * 24 * 60 * 60; // 15 days
}

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction, // Only true in prod
  sameSite: isProduction ? "None" : "Lax", // Lax for non-prod, None for prod
  maxAge: accessExpiry * 1000, // milliseconds
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction, // Only true in prod
  sameSite: isProduction ? "None" : "Lax", // Lax for non-prod, None for prod
  maxAge: refreshExpiry * 1000, // milliseconds
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction, // Only true in prod
  sameSite: isProduction ? "None" : "Lax", // Lax for non-prod, None for prod
};

module.exports = {
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
};
