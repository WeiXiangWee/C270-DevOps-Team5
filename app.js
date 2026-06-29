
// Imports express.js 
const express = require("express");
// Creates an Express application
const app = express();

// Middleware to read form data from users
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/images', express.static('images'));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Defines a route to render the index (home) page
app.get("/", (req, res) => {
    res.render("index");
});