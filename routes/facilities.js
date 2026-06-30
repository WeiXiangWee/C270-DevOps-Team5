const express = require('express');
const router = express.Router();

// In-memory storage - matching Feature 4's facility list
const facilities = [
    { id: 1, name: 'Competition Hall', category: 'Indoor', capacity: 500 },
    { id: 2, name: 'Badminton Hall (6 Courts)', category: 'Indoor', capacity: 24 },
    { id: 3, name: 'Table Tennis Hall (6 Tables)', category: 'Indoor', capacity: 12 },
    { id: 4, name: 'Multi-Purpose Hall', category: 'Indoor', capacity: 100 },
    { id: 5, name: 'Tennis / Basketball / Futsal Court', category: 'Outdoor', capacity: 30 },
    { id: 6, name: 'Football and Rugby Field', category: 'Outdoor', capacity: 100 },
    { id: 7, name: 'Swimming Pool', category: 'Aquatics', capacity: 50 },
    { id: 8, name: 'Martial Arts Room', category: 'Indoor', capacity: 50 }
];

// GET - View all facilities
router.get('/facilities', (req, res) => {
    res.render('facilityDetails', { facilities });
});

// GET - Show add facility form (admin only)
router.get('/facilities/add', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    res.render('addFacility');
});

// POST - Add new facility
router.post('/facilities/add', (req, res) => {
    const { name, category, capacity } = req.body;

    facilities.push({
        id: facilities.length + 1,
        name,
        category,
        capacity: parseInt(capacity)
    });

    res.redirect('/facilities');
});

// GET - Show edit facility form (admin only)
router.get('/facilities/edit/:id', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    const facility = facilities.find(f => f.id == req.params.id);
    res.render('editFacility', { facility });
});

// POST - Update facility
router.post('/facilities/edit/:id', (req, res) => {
    const { name, category, capacity } = req.body;
    const facility = facilities.find(f => f.id == req.params.id);

    if (facility) {
        facility.name = name;
        facility.category = category;
        facility.capacity = parseInt(capacity);
    }

    res.redirect('/facilities');
});

// POST - Delete facility
router.post('/facilities/delete/:id', (req, res) => {
    const index = facilities.findIndex(f => f.id == req.params.id);
    if (index !== -1) {
        facilities.splice(index, 1);
    }
    res.redirect('/facilities');
});

module.exports = router;