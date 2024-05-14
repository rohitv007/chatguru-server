require("dotenv").config();

const allowedOrigins = [process.env.HTTP_CLIENT_URL, process.env.WSS_CLIENT_URL, 'http://localhost:5173'];
console.log(allowedOrigins);

module.exports = allowedOrigins;