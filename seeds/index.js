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
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            title: `${places[i]}, ${descriptors[i]}`,
            location: `${cities[i].city}, ${cities[i].state}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            price,
            description:
                "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Id minima fugiat dicta et natus tempore, placeat provident voluptates unde a facilis vitae nostrum quis quos accusamus ad pariatur quo doloribus.",
        });

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
