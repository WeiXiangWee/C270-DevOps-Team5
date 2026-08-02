const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Wu Shutong's segment //

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
// Wu Shutong's segment ends here //

// Geeta's segment for booking management (add, cancel) //

// GET - Book directly from search page
router.get('/bookings/add', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { name, date, time } = req.query;

    try {
        // Prevent double booking
        const [existing] = await db.query(
            'SELECT * FROM bookings WHERE userId = ? AND date = ? AND duration = ? AND status = ?',
            [req.session.user.id, date, time, 'confirmed']
        );

        if (existing.length > 0) {
            return res.redirect('/search?error=double_booking');
        }

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

// POST - User cancel own booking
router.post('/bookings/user-cancel/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND userId = ?',
            [req.params.id, req.session.user.id]
        );

        if (bookings.length === 0) {
            return res.redirect('/bookings');
        }

        await db.query(
            'UPDATE bookings SET status = ?, remarks = ?, remarks_status = ? WHERE id = ?',
            ['cancelled', 'Cancelled by user', 'shown', req.params.id]
        );

        const booking = bookings[0];
        const bookedSlots = req.app.locals.bookedSlots;
        const index = bookedSlots.findIndex(s =>
            s.facility === booking.name &&
            s.date === booking.date &&
            s.time === booking.duration
        );
        if (index !== -1) bookedSlots.splice(index, 1);

        res.redirect('/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/bookings');
    }
});

// POST - Admin cancel booking with reason
router.post('/bookings/cancel/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { reason } = req.body;

    try {
        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE id = ?',
            [req.params.id]
        );

        if (bookings.length === 0) {
            return res.redirect('/bookings');
        }

        const booking = bookings[0];

        const [users] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [booking.userId]
        );

        await db.query(
            'UPDATE bookings SET status = ?, remarks = ?, remarks_status = ? WHERE id = ?',
            ['cancelled', reason || 'Cancelled by admin', 'pending', req.params.id]
        );

        if (users.length > 0) {
            const user = users[0];
            await transporter.sendMail({
                from: `"RP Sports Booking" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Booking Cancellation Notice - RP Sports Booking',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                        <div style="background-color: #1a4d2e; padding: 20px; text-align: center;">
                            <h2 style="color: white; margin: 0;">RP Sports Booking</h2>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h3 style="color: #c0392b;">Booking Cancellation Notice</h3>
                            <p>Dear <strong>${user.name}</strong>,</p>
                            <p>Your booking has been cancelled by the admin.</p>
                            <div style="background: #fff; border: 1px solid #ddd; 
                                        border-radius: 8px; padding: 16px; margin: 16px 0;">
                                <p><strong>Facility:</strong> ${booking.name}</p>
                                <p><strong>Date:</strong> ${booking.date}</p>
                                <p><strong>Time:</strong> ${booking.duration}</p>
                                <p><strong>Reason:</strong> ${reason || 'Cancelled by admin'}</p>
                            </div>
                            <p style="color: #666;">
                                Please login to the system to make a new booking.
                            </p>
                        </div>
                        <div style="background-color: #1a4d2e; padding: 15px; text-align: center;">
                            <p style="color: white; margin: 0; font-size: 12px;">
                                © 2026 RP Sports Booking System | Republic Polytechnic
                            </p>
                        </div>
                    </div>
                `
            });
        }

        res.redirect('/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/bookings');
    }
});
// Geeta's segment ends here //

// Yan and Wu Shutong's segment for maintenance management //

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
        // Step 1: Insert maintenance record
        await db.query(
            'INSERT INTO maintenance (facility, startDate, endDate, reason) VALUES (?, ?, ?, ?)',
            [facility, startDate, endDate, reason]
        );

        // Step 2: Get affected bookings FIRST (before cancelling!)
        const [affectedBookings] = await db.query(
            `SELECT 
                u.name AS user_name,
                u.email,
                b.name AS facility,
                b.date,
                b.duration
            FROM bookings b
            JOIN users u ON b.userId = u.id
            WHERE b.name = ?
            AND b.status = 'confirmed'
            AND b.date BETWEEN ? AND ?`,
            [facility, startDate, endDate]
        );

        console.log("Affected bookings:", affectedBookings);

        // Step 3: Cancel the bookings (only once!)
        await db.query(
            `UPDATE bookings 
             SET status = 'cancelled', 
                 remarks = ?, 
                 remarks_status = 'pending'
             WHERE name = ? 
             AND date BETWEEN ? AND ? 
             AND status = 'confirmed'`,
            [`Facility under maintenance: ${reason}`, facility, startDate, endDate]
        );

        // Step 4: Send n8n notification for each affected booking
        for (const booking of affectedBookings) {
            try {
                await axios.post(
                    process.env.N8N_MAINTENANCE_WEBHOOK,
                    {
                        name: booking.user_name,
                        email: booking.email,
                        facility: booking.facility,
                        bookingDate: booking.date,
                        timeSlot: booking.duration,
                        startDate: startDate,
                        endDate: endDate,
                        reason: reason
                    }
                );
                console.log('N8N notification sent to:', booking.email);
            } catch (error) {
                console.error('N8N webhook error:', error.message);
            }
        }

        // Step 5: Add maintenance slots to bookedSlots array
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
// Yan and Wu Shutong's segment ends here //

// Yan's segment for n8n API routes //

// GET - Booking reminders API for n8n
router.get('/api/bookings/reminders', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                u.name AS user_name,
                u.email,
                b.name AS facility,
                b.date,
                b.duration
            FROM bookings b
            JOIN users u ON b.userId = u.id
            WHERE b.status = 'confirmed'
        `);
        res.json(rows);
    } catch (err) {
        console.error("Reminder API error:", err);
        res.status(500).json({ error: "Failed to load reminders" });
    }
});

module.exports = router;