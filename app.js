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

const facilities = [
    { name: 'Badminton Hall (6 Courts)', type: 'Indoor Hub' },
    { name: 'Swimming Pool', type: 'Aquatics' },
    { name: 'Football and Rugby Field', type: 'Outdoor' },
    { name: 'Competition Hall', type: 'Indoor Hub' },
    { name: 'Table Tennis Hall (6 Tables)', type: 'Indoor Hub' },
    { name: 'Multi-Purpose Hall', type: 'Indoor Hub' },
    { name: 'Tennis / Basketball / Futsal Court', type: 'Outdoor' },
    { name: 'Martial Arts Room', type: 'Level 2' }
];

const timeSlots = [
    '07:00 – 09:00',
    '09:00 – 11:00',
    '11:00 – 13:00',
    '13:00 – 15:00',
    '15:00 – 17:00',
    '17:00 – 19:00',
    '19:00 – 21:00'
];

function getSlotsForDate(dateStr) {
    const d = new Date(dateStr);
    const displayDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const slots = [];
    let id = 1;

    facilities.forEach(facility => {
        timeSlots.forEach(time => {
            slots.push({
                id: id++,
                facility: facility.name,
                type: facility.type,
                date: dateStr,
                displayDate: displayDate,
                time: time,
                status: 'available'
            });
        });
    });

    return slots;
}

// Store booked slots
const bookedSlots = [];
app.locals.bookedSlots = bookedSlots;

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

    const { facility, date } = req.query;

    // Default to today
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = date || today;
    const selectedFacility = facility || '';

    // Generate slots for selected date
    let slots = getSlotsForDate(selectedDate);

    // Mark booked slots as unavailable
    const bookedSlots = app.locals.bookedSlots;
    slots = slots.map(slot => {
        const isBooked = bookedSlots.find(b =>
            b.facility === slot.facility &&
            b.date === slot.date &&
            b.time === slot.time
        );
        return isBooked ? { ...slot, status: 'booked' } : slot;
    });

    // Filter by facility if selected
    if (selectedFacility !== '') {
        slots = slots.filter(s => s.facility === selectedFacility);
    }

    res.render('search', {
        slots: slots,
        selectedFacility: selectedFacility,
        selectedDate: selectedDate,
        searched: req.query.facility !== undefined || req.query.date !== undefined
    });
});

app.get("/availability", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.redirect('/search');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});