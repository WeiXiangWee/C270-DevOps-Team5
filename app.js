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

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const facilitiesRoutes = require('./routes/facilities');
app.use('/', facilitiesRoutes);

const bookingsRoutes = require('./routes/bookings');
app.use('/', bookingsRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render("dashboard");
});

app.get("/search", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render("search");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});