const express = require('express');
const router = express.Router();

const bookings = [];
const maintenanceList = [];

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

    let showAlert = false;
    let newCancellations = 0;

    if (req.session.user.role !== 'admin') {
        const newlyCancelled = userBookings.filter(
            b => b.status === 'cancelled' && b.remarks_status !== 'shown'
        );

        if (newlyCancelled.length > 0) {
            showAlert = true;
            newCancellations = newlyCancelled.length;
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

// GET - Show maintenance form (admin only)
router.get('/maintenance', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    res.render('maintenance', { maintenanceList, message: null });
});

// POST - Schedule maintenance
router.post('/maintenance/add', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { facility, startDate, endDate, reason } = req.body;

    maintenanceList.push({
        id: maintenanceList.length + 1,
        facility,
        startDate,
        endDate,
        reason
    });

    // Cancel ALL existing bookings in that date range
    let cancelledCount = 0;
    bookings.forEach(booking => {
        if (booking.name === facility) {
            const bookingDate = new Date(booking.date);
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (bookingDate >= start && bookingDate <= end &&
                booking.status === 'confirmed') {
                booking.status = 'cancelled';
                booking.remarks = `Facility under maintenance: ${reason}`;
                booking.remarks_status = 'pending';
                cancelledCount++;
            }
        }
    });

    // Add maintenance slots to bookedSlots
    const bookedSlots = req.app.locals.bookedSlots;
    const timeSlots = [
        '07:00 – 09:00',
        '09:00 – 11:00',
        '11:00 – 13:00',
        '13:00 – 15:00',
        '15:00 – 17:00',
        '17:00 – 19:00',
        '19:00 – 21:00'
    ];

    let currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        timeSlots.forEach(time => {
            bookedSlots.push({
                facility: facility,
                date: dateStr,
                time: time,
                maintenance: true
            });
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    res.render('maintenance', {
        maintenanceList,
        message: `Maintenance scheduled for ${facility} from ${startDate} to ${endDate}. ${cancelledCount} booking(s) cancelled.`
    });
});

// POST - Delete maintenance
router.post('/maintenance/delete/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const maintenance = maintenanceList.find(m => m.id == req.params.id);

    if (maintenance) {
        const bookedSlots = req.app.locals.bookedSlots;

        let currentDate = new Date(maintenance.startDate);
        const endDateObj = new Date(maintenance.endDate);

        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];

            const indexesToRemove = [];
            bookedSlots.forEach((slot, index) => {
                if (slot.facility === maintenance.facility &&
                    slot.date === dateStr &&
                    slot.maintenance === true) {
                    indexesToRemove.push(index);
                }
            });

            indexesToRemove.reverse().forEach(index => {
                bookedSlots.splice(index, 1);
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        const index = maintenanceList.findIndex(m => m.id == req.params.id);
        if (index !== -1) {
            maintenanceList.splice(index, 1);
        }
    }

    res.redirect('/maintenance');
});

// Export bookings array for notification check
router.getBookings = () => bookings;

module.exports = router;