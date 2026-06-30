const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const users = [];

router.get('/register', (req, res) => {
    res.render('register', { message: null });
});

router.post('/register', async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', { message: 'Passwords do not match!' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.render('register', { message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        id: users.length + 1,
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'user'
    });

    console.log('Registered users:', users);

    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login', { message: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.render('login', { message: 'Invalid email or password!' });
    }

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
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// TEMPORARY - for testing admin view (remove before final submission)
router.get('/make-admin/:email', (req, res) => {
    const user = users.find(u => u.email === req.params.email);
    if (user) {
        user.role = 'admin';
        res.send('User is now admin! Logout and login again to see changes.');
    } else {
        res.send('User not found');
    }
});

module.exports = router;