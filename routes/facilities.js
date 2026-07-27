const express = require('express');
const router = express.Router();
const db = require('../db');

// GET - View all facilities
router.get('/facilities', async (req, res) => {
    try {
        const [facilities] = await db.query('SELECT * FROM facilities');
        res.render('facilityDetails', { facilities });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

// GET - Show add facility form (admin only)
router.get('/facilities/add', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    res.render('addFacility');
});

// POST - Add new facility
router.post('/facilities/add', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { name, category, capacity, location, equipment, description, image } = req.body;

    try {
        await db.query(
            'INSERT INTO facilities (name, category, capacity, image, description, location, equipment) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, parseInt(capacity),
             image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
             description || 'No description available.',
             location || 'Sports Complex',
             equipment || 'To be updated']
        );
        res.redirect('/facilities');
    } catch (err) {
        console.error(err);
        res.redirect('/facilities');
    }
});

// GET - Show edit facility form (admin only)
router.get('/facilities/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    try {
        const [facilities] = await db.query(
            'SELECT * FROM facilities WHERE id = ?', [req.params.id]
        );
        res.render('editFacility', { facility: facilities[0] });
    } catch (err) {
        console.error(err);
        res.redirect('/facilities');
    }
});

// POST - Update facility
router.post('/facilities/edit/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    const { name, category, capacity, location, equipment, description, image } = req.body;

    try {
        await db.query(
            'UPDATE facilities SET name = ?, category = ?, capacity = ?, image = ?, description = ?, location = ?, equipment = ? WHERE id = ?',
            [name, category, parseInt(capacity),
             image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
             description || 'No description available.',
             location || 'Sports Complex',
             equipment || 'To be updated',
             req.params.id]
        );
        res.redirect('/facilities');
    } catch (err) {
        console.error(err);
        res.redirect('/facilities');
    }
});

// POST - Delete facility
router.post('/facilities/delete/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }

    try {
        // Get facility details first
        const [facility] = await db.query(
            'SELECT * FROM facilities WHERE id = ?',
            [req.params.id]
        );

        if (facility.length === 0) {
            return res.redirect('/facilities');
        }

        // Cancel all active bookings for this facility
        const [activeBookings] = await db.query(
            "SELECT * FROM bookings WHERE name = ? AND status = 'confirmed'",
            [facility[0].name]
        );

        if (activeBookings.length > 0) {
            await db.query(
                "UPDATE bookings SET status = 'cancelled', remarks = ?, remarks_status = 'pending' WHERE name = ? AND status = 'confirmed'",
                ['Facility has been removed from the system', facility[0].name]
            );

            // Remove from bookedSlots array
            const bookedSlots = req.app.locals.bookedSlots;
            const facilityName = facility[0].name;
            const indexesToRemove = [];
            bookedSlots.forEach((slot, index) => {
                if (slot.facility === facilityName) {
                    indexesToRemove.push(index);
                }
            });
            indexesToRemove.reverse().forEach(index => bookedSlots.splice(index, 1));
        }

        await db.query('DELETE FROM facilities WHERE id = ?', [req.params.id]);
        res.redirect('/facilities');
    } catch (err) {
        console.error(err);
        res.redirect('/facilities');
    }
});

module.exports = router;