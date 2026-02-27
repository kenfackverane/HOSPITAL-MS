const mongoose = require("mongoose");

async function connectDB() {
  const url = process.env.MONGO_URL;
  await mongoose.connect(url);
  console.log("✅ Connected to MongoDB:", url);
}

module.exports = connectDB;