const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI ontbreekt. Database wordt nog niet verbonden.");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database verbonden");
  } catch (error) {
    console.error("Databasefout:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;