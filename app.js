// Imports express.js 
const express = require("express");
// Creates an Express application
const app = express();

// Middleware to read form data from users
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Set EJS as the view engine
app.set("view engine", "ejs");

// Defines a route to render the index (home) page
app.get("/", (req, res) => {
    res.render("index");
});


// Serves Feature 4 UI view dashboard module
app.get("/availability", (req, res) => {
    res.render("search");
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
