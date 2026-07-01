const express = require('express');
const router = express.Router();

const facilities = [
    { 
        id: 1, 
        name: 'Competition Hall', 
        category: 'Indoor', 
        capacity: 500,
        image: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=600',
        description: 'Fully air-conditioned hall for basketball, volleyball and netball. Features gallery stand for spectators.'
    },
    { 
        id: 2, 
        name: 'Badminton Hall (6 Courts)', 
        category: 'Indoor', 
        capacity: 24,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600',
        description: '6 professional badminton courts with wooden flooring. Suitable for recreational play and competitive matches.'
    },
    { 
        id: 3, 
        name: 'Table Tennis Hall (6 Tables)', 
        category: 'Indoor', 
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=600',
        description: '6 table tennis tables available for booking and casual play sessions.'
    },
    { 
        id: 4, 
        name: 'Multi-Purpose Hall', 
        category: 'Indoor', 
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
        description: 'Versatile hall suitable for various sports and indoor activities.'
    },
    { 
        id: 5, 
        name: 'Tennis / Basketball / Futsal Court', 
        category: 'Outdoor', 
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=600',
        description: 'Multi-purpose outdoor court for tennis, basketball and futsal.'
    },
    { 
        id: 6, 
        name: 'Football and Rugby Field', 
        category: 'Outdoor', 
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600',
        description: 'Full size football and rugby field with 500-pax seating gallery at the highest point of RP campus.'
    },
    { 
        id: 7, 
        name: 'Swimming Pool', 
        category: 'Aquatics', 
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
        description: 'Olympic-size pool with warm-up pool and baby wading pool. 300-pax viewing gallery available.'
    },
    { 
        id: 8, 
        name: 'Martial Arts Room', 
        category: 'Indoor', 
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600',
        description: '50 persons capacity with tatami mats. Suitable for taekwondo, judo, aikido and other martial arts.'
    }
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
        capacity: parseInt(capacity),
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
        description: 'No description available.'
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