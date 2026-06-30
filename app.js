const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

app.use(session({
    secret: 'rp_sports_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Make session available in all EJS views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

 // HEAD
app.get("/about", (req, res) => {
    res.render("about");
});


// Defines a route to render the my bookings page
// app.get("/bookings", (req, res) => {
//     res.render("bookings");
// });

// Defines a route to render the add booking page
app.get("/bookings/add", (req, res) => {
    res.render("addBooking");
});

// Feature 2 form to add a new facility
app.get("/facilities/add", (req, res) => {
    res.render("addFacility");
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