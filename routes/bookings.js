const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - View all bookings
router.get('/bookings', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        let bookings;
        if (req.session.user.role === 'admin') {
            const [rows] = await db.query(
                'SELECT * FROM bookings ORDER BY created_at DESC'
            );
            bookings = rows;
        } else {
            const [rows] = await db.query(
                'SELECT * FROM bookings WHERE userId = ? ORDER BY created_at DESC',
                [req.session.user.id]
            );
            bookings = rows;
        }

        let showAlert = false;
        let newCancellations = 0;

        if (req.session.user.role !== 'admin') {
            const newlyCancelled = bookings.filter(
                b => b.status === 'cancelled' && b.remarks_status === 'pending'
            );

            if (newlyCancelled.length > 0) {
                showAlert = true;
                newCancellations = newlyCancelled.length;

                await db.query(
                    'UPDATE bookings SET remarks_status = ? WHERE userId = ? AND status = ? AND remarks_status = ?',
                    ['shown', req.session.user.id, 'cancelled', 'pending']
                );
            }
        }

        res.render('bookings', { bookings, showAlert, newCancellations });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

// GET - Book directly from search page
router.get('/bookings/add', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { name, date, time } = req.query;

    try {
        await db.query(
            'INSERT INTO bookings (userId, userName, name, date, duration, remarks, status, remarks_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.session.user.id, req.session.user.name,
             name || 'Facility', date || 'Not specified',
             time || 'Not specified', '', 'confirmed', 'shown']
        );

        const bookedSlots = req.app.locals.bookedSlots;
        bookedSlots.push({ facility: name, date: date, time: time });

        res.render('bookingSuccess', { booking: { name, date, duration: time } });
    } catch (err) {
        console.error(err);
        res.redirect('/search');
    }
});

// POST - Admin cancel booking with reason
router.post('/bookings/cancel/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { reason } = req.body;

    try {
        await db.query(
            'UPDATE bookings SET status = ?, remarks = ?, remarks_status = ? WHERE id = ?',
            ['cancelled', reason || 'Cancelled by admin', 'pending', req.params.id]
        );
        res.redirect('/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/bookings');
    }
});

// GET - Show maintenance form (admin only)
router.get('/maintenance', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    try {
        const [maintenanceList] = await db.query(
            'SELECT * FROM maintenance ORDER BY created_at DESC'
        );
        res.render('maintenance', { maintenanceList, message: null });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

// POST - Schedule maintenance
router.post('/maintenance/add', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { facility, startDate, endDate, reason } = req.body;

    try {
        await db.query(
            'INSERT INTO maintenance (facility, startDate, endDate, reason) VALUES (?, ?, ?, ?)',
            [facility, startDate, endDate, reason]
        );

        await db.query(
            `UPDATE bookings SET status = 'cancelled', remarks = ?, remarks_status = 'pending'
             WHERE name = ? AND date BETWEEN ? AND ? AND status = 'confirmed'`,
            [`Facility under maintenance: ${reason}`, facility, startDate, endDate]
        );

        const bookedSlots = req.app.locals.bookedSlots;
        const timeSlots = [
            '07:00 – 09:00', '09:00 – 11:00', '11:00 – 13:00',
            '13:00 – 15:00', '15:00 – 17:00', '17:00 – 19:00', '19:00 – 21:00'
        ];

        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            timeSlots.forEach(time => {
                bookedSlots.push({ facility, date: dateStr, time, maintenance: true });
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const [maintenanceList] = await db.query(
            'SELECT * FROM maintenance ORDER BY created_at DESC'
        );
        res.render('maintenance', {
            maintenanceList,
            message: `Maintenance scheduled for ${facility} from ${startDate} to ${endDate}.`
        });
    } catch (err) {
        console.error(err);
        res.redirect('/maintenance');
    }
});

// POST - Delete maintenance
router.post('/maintenance/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM maintenance WHERE id = ?', [req.params.id]
        );
        const maintenance = rows[0];

        if (maintenance) {
            const bookedSlots = req.app.locals.bookedSlots;
            let currentDate = new Date(maintenance.startDate);
            const endDateObj = new Date(maintenance.endDate);

            while (currentDate <= endDateObj) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const indexesToRemove = [];
                bookedSlots.forEach((slot, index) => {
                    if (slot.facility === maintenance.facility &&
                        slot.date === dateStr && slot.maintenance === true) {
                        indexesToRemove.push(index);
                    }
                });
                indexesToRemove.reverse().forEach(index => bookedSlots.splice(index, 1));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            await db.query('DELETE FROM maintenance WHERE id = ?', [req.params.id]);
        }

        res.redirect('/maintenance');
    } catch (err) {
        console.error(err);
        res.redirect('/maintenance');
    }
});

module.exports = router;