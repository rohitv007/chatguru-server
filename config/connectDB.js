const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const connectDB = asyncHandler(async () => {
  const uri = process.env.DATABASE_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      "Database connected:",
      conn.connection.host,
      conn.connection.name
    );
  } catch (error) {
    // gracefully handling error in db connection
    // let's say that max number to retries avbl to connect to db is 3
    // we can keep on trying to connect in the catch block for upto 3 trials
    // else we will exit the process

    console.error("Error connecting to database:", error);

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        await new Promise((resolve) => setTimeout(() => resolve, 5000));
        await mongoose.connect(uri);
        console.log("Database connection successful after retry.");
        break;
      } catch (retryErr) {
        console.error("Retry attempt failed:", retryErr);
        retries++;
      }
    }

    if (retries === maxRetries) {
      console.error("Failed to connect to database after retries. Exiting.");
      process.exit(1);
    }
  }
});

module.exports = connectDB;
