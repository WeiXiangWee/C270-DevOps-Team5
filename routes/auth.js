const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

router.get('/register', (req, res) => {
    res.render('register', { message: null });
});

router.post('/register', async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate RP email format
    const studentEmailRegex = /^\d{8}@myrp\.edu\.sg$/;
    const staffEmailRegex = /^\d{8}@rp\.edu\.sg$/;

    if (!studentEmailRegex.test(email) && !staffEmailRegex.test(email)) {
        return res.render('register', {
            message: 'Invalid email address!'
        });
    }

    if (password !== confirmPassword) {
        return res.render('register', { message: 'Passwords do not match!' });
    }

    try {
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        if (existing.length > 0) {
            return res.render('register', { message: 'Email already registered!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, 'user']
        );

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { message: 'Something went wrong!' });
    }
});

router.get('/login', (req, res) => {
    res.render('login', { message: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return res.render('login', { message: 'Invalid email or password!' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { message: 'Invalid email or password!' });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { message: 'Something went wrong!' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;