const express = require('express');
const router = express.Router();

const bookings = [
    
];

// GET - View all bookings
router.get('/bookings', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    let userBookings;
    if (req.session.user.role === 'admin') {
        userBookings = bookings;
    } else {
        userBookings = bookings.filter(b => b.userId == req.session.user.id);
    }

    // Default values
    let showAlert = false;
    let newCancellations = 0;

    // Only check for regular users
    if (req.session.user.role !== 'admin') {
        const newlyCancelled = userBookings.filter(
            b => b.status === 'cancelled' && b.remarks_status !== 'shown'
        );

        if (newlyCancelled.length > 0) {
            showAlert = true;
            newCancellations = newlyCancelled.length;

            // Mark all as shown
            newlyCancelled.forEach(b => {
                b.remarks_status = 'shown';
            });
        }
    }

    res.render('bookings', {
        bookings: userBookings,
        showAlert: showAlert,
        newCancellations: newCancellations
    });
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
        status: 'confirmed',
        remarks_status: 'shown'
    };

    bookings.push(newBooking);

    // Mark this slot as booked
    const bookedSlots = req.app.locals.bookedSlots;
    bookedSlots.push({
        facility: name,
        date: date,
        time: time
    });

    res.render('bookingSuccess', { booking: newBooking });
});

// POST - Admin cancel booking with reason
router.post('/bookings/cancel/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { reason } = req.body;
    const booking = bookings.find(b => b.id == req.params.id);

    if (booking) {
        booking.status = 'cancelled';
        booking.remarks = reason || 'Cancelled by admin';
        booking.remarks_status = 'pending';
    }

    res.redirect('/bookings');
});

module.exports = router;