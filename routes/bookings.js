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

// GET - Book directly from search page
router.get('/bookings/add', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { name, date, time } = req.query;

    const newBooking = {
        id: bookings.length + 1,
        userId: req.session.user.id,
        userName: req.session.user.name,
        name: name || 'Facility',
        date: date || 'Not specified',
        duration: time || 'Not specified',
        remarks: '',
        status: 'confirmed'
    };

    bookings.push(newBooking);

    // Mark this slot as booked using YYYY-MM-DD date format
    const bookedSlots = req.app.locals.bookedSlots;
    bookedSlots.push({
        facility: name,
        date: date,
        time: time
    });

    console.log('Booked slots:', bookedSlots);

    res.render('bookingSuccess', { booking: newBooking });
});

module.exports = router;