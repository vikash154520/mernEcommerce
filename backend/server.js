const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`error:${err.message}`);
  console.log(`Shutting down the server due to Uncaught Rejection`);
  process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "PRODUCTION")
  require("dotenv").config({ path: "backend/config/config.env" });

// Connecting Database
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// server Created
const server = app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});

// Unhandled Promisses
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
