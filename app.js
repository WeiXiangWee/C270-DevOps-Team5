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

    // Check for new cancellations for logged in users
    if (req.session.user && req.session.user.role !== 'admin') {
        const bookingsRoute = require('./routes/bookings');
        const allBookings = bookingsRoute.getBookings();
        const userBookings = allBookings.filter(b => b.userId == req.session.user.id);
        const hasNewCancellations = userBookings.some(
            b => b.status === 'cancelled' && b.remarks_status !== 'shown'
        );
        res.locals.hasNewCancellations = hasNewCancellations;
    } else {
        res.locals.hasNewCancellations = false;
    }

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

const weekdayTimeSlots = [
    '07:00 – 09:00',
    '09:00 – 11:00',
    '11:00 – 13:00',
    '13:00 – 15:00',
    '15:00 – 17:00',
    '17:00 – 19:00',
    '19:00 – 21:00'
];

const saturdayTimeSlots = [
    '07:00 – 09:00',
    '09:00 – 11:00',
    '11:00 – 13:00'
];

const publicHolidays = [
    '2026-01-01',
    '2026-01-29',
    '2026-01-30',
    '2026-04-03',
    '2026-05-01',
    '2026-05-12',
    '2026-06-02',
    '2026-08-09',
    '2026-08-10',
    '2026-10-27',
    '2026-12-25',
];

function getSlotsForDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();

    console.log(`Date: ${dateStr}, Day of week: ${dayOfWeek}`);

    if (dayOfWeek === 0 || publicHolidays.includes(dateStr)) {
        return [];
    }

    const displayDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const timeSlots = dayOfWeek === 6 ? saturdayTimeSlots : weekdayTimeSlots;

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

    const today = new Date().toISOString().split('T')[0];
    const selectedDate = date || today;
    const selectedFacility = facility || '';

    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const isClosed = d.getDay() === 0 || publicHolidays.includes(selectedDate);

    let slots = getSlotsForDate(selectedDate);

    const bookedSlots = app.locals.bookedSlots;
    slots = slots.map(slot => {
        const bookedSlot = bookedSlots.find(b =>
            b.facility === slot.facility &&
            b.date === slot.date &&
            b.time === slot.time
        );
        if (bookedSlot) {
            return { ...slot, status: bookedSlot.maintenance ? 'maintenance' : 'booked' };
        }
        return slot;
    });

    if (selectedFacility !== '') {
        slots = slots.filter(s => s.facility === selectedFacility);
    }

    res.render('search', {
        slots: slots,
        selectedFacility: selectedFacility,
        selectedDate: selectedDate,
        searched: req.query.facility !== undefined || req.query.date !== undefined,
        isClosed: isClosed
    });
});

app.get("/availability", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.redirect('/search');
});

// Contact Us - accessible without login
app.get("/contact", (req, res) => {
    res.render("contact");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});