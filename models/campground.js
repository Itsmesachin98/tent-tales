const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    image: String,
    title: String,
    price: Number,
    description: String,
    location: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
