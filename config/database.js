const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
        console.log("Database connected!");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1); // exit process if DB fails
    }
};

module.exports = connectDB;
