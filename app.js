const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

// Defines a route to render the my bookings page
// app.get("/bookings", (req, res) => {
//     res.render("bookings");
// });

// Defines a route to render the add booking page
app.get("/bookings/add", (req, res) => {
    res.render("addBooking");
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