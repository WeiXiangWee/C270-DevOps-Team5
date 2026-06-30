const express = require('express');
const router = express.Router();

const bookings = [];

// GET - View all bookings
router.get('/bookings', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    let userBookings;
    if (req.session.user.role === 'admin') {
        userBookings = bookings;
    } else {
        userBookings = bookings.filter(b => b.userId === req.session.user.id);
    }

    res.render('bookings', { bookings: userBookings });
});

// GET - Show add booking form
router.get('/bookings/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('addBooking');
});

// POST - Add new booking
router.post('/bookings/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { name, date, duration, remarks } = req.body;

    bookings.push({
        id: bookings.length + 1,
        userId: req.session.user.id,
        userName: req.session.user.name,
        name,
        date,
        duration,
        remarks,
        status: 'confirmed'
    });

    res.redirect('/bookings');
});

module.exports = router;