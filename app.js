require('dotenv').config();
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

app.use(async (req, res, next) => {
    res.locals.session = req.session;

    if (req.session.user && req.session.user.role !== 'admin') {
        try {
            const db = require('./db');
            const [rows] = await db.query(
                'SELECT * FROM bookings WHERE userId = ? AND status = ? AND remarks_status = ?',
                [req.session.user.id, 'cancelled', 'pending']
            );
            res.locals.hasNewCancellations = rows.length > 0;
        } catch (err) {
            res.locals.hasNewCancellations = false;
        }
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

app.get("/search", async (req, res) => {
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

    // Load facilities from database dynamically!
    const db = require('./db');
    const [dbFacilities] = await db.query('SELECT * FROM facilities');

    let slots = getSlotsForDate(selectedDate, dbFacilities);

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
        slots,
        selectedFacility,
        selectedDate,
        facilities: dbFacilities,
        searched: req.query.facility !== undefined || req.query.date !== undefined,
        isClosed
    });
});

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

function getSlotsForDate(dateStr, facilitiesList) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();

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

    facilitiesList.forEach(facility => {
        timeSlots.forEach(time => {
            slots.push({
                id: id++,
                facility: facility.name,
                type: facility.category,
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

async function loadBookedSlots() {
    try {
        const db = require('./db');

        const [bookings] = await db.query(
            "SELECT name, date, duration FROM bookings WHERE status = 'confirmed'"
        );
        bookings.forEach(b => {
            bookedSlots.push({
                facility: b.name,
                date: b.date,
                time: b.duration
            });
        });

        const [maintenanceList] = await db.query('SELECT * FROM maintenance');
        const timeSlots = [
            '07:00 – 09:00', '09:00 – 11:00', '11:00 – 13:00',
            '13:00 – 15:00', '15:00 – 17:00', '17:00 – 19:00', '19:00 – 21:00'
        ];

        const [dbFacilitiesForLoad] = await db.query('SELECT * FROM facilities');

maintenanceList.forEach(m => {
            let currentDate = new Date(m.startDate);
            const endDateObj = new Date(m.endDate);

            while (currentDate <= endDateObj) {
                const dateStr = currentDate.toISOString().split('T')[0];
                timeSlots.forEach(time => {
                    bookedSlots.push({
                        facility: m.facility,
                        date: dateStr,
                        time: time,
                        maintenance: true
                    });
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        console.log(`✅ Loaded ${bookings.length} bookings and ${maintenanceList.length} maintenance records`);
    } catch (err) {
        console.error('Error loading slots:', err.message);
    }
}

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

app.get("/search", async (req, res) => {
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

    // Load facilities from database dynamically
    const db = require('./db');
    const [dbFacilities] = await db.query('SELECT * FROM facilities');

    let slots = getSlotsForDate(selectedDate, dbFacilities);

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
        slots,
        selectedFacility,
        selectedDate,
        facilities: dbFacilities,
        searched: req.query.facility !== undefined || req.query.date !== undefined,
        isClosed
    });
});

app.get("/availability", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.redirect('/search');
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
        await loadBookedSlots();
    });
}

module.exports = {
    app,
    getSlotsForDate
};