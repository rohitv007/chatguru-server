require("dotenv").config();

const allowedOrigins = [process.env.CLIENT_URL, process.env.WSS_CLIENT_URL];

module.exports = allowedOrigins;