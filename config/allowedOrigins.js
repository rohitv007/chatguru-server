require("dotenv").config();

const allowedOrigins = [process.env.CLIENT_URL, process.env.WSS_CLIENT_URL];
console.log(allowedOrigins);

module.exports = allowedOrigins;