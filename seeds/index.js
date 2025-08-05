const mongoose = require("mongoose");
const Campground = require("../models/campground");

const { places, descriptors } = require("./seedHelpers");
const cities = require("./cities");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected!");
});

async function seedDB() {
    await Campground.deleteMany({});

    for (let i = 0; i < descriptors.length; i++) {
        const camp = new Campground({
            title: `${places[i]}, ${descriptors[i]}`,
            location: `${cities[i].city}, ${cities[i].state}`,
        });

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
