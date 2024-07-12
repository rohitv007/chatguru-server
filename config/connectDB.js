const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { DB_NAME } = require("../constants");

const connectDB = asyncHandler(async () => {
  const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const connectionInstance = await mongoose.connect(connectionString);
      console.log(
        `DB Connected : ${connectionInstance.connection.host}, ${connectionInstance.connection.name}`
      );
      return connectionInstance;
    } catch (error) {
      // gracefully handling error in db connection
      // let's say that max number of retries avbl to connect to db is 3
      // we can keep on trying to connect in the catch block for upto 3 trials
      // else we will exit the process
      console.error(
        `Attempt ${retries + 1} - Error connecting to database:`,
        error
      );
      retries++;
      if (retries < maxRetries) {
        console.log(
          `Retrying to connect in 5 seconds... (${retries}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        console.error("Max retries reached. Exiting.");
        process.exit(1);
      }
    }
  }
});

module.exports = connectDB;
