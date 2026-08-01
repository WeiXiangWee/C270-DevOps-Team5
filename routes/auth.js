const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const nodemailer = require('nodemailer');

console.log('Using email:', process.env.EMAIL_USER);
console.log('Pass length:', process.env.EMAIL_PASS?.length);

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

// GET Register page
router.get('/register', (req, res) => {
    res.render('register', { message: null });
});

// POST Register
router.post('/register', async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    const studentEmailRegex = /^\d{8}@myrp\.edu\.sg$/;
    const staffEmailRegex = /^[a-zA-Z0-9._%+-]+@rp\.edu\.sg$/;

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

        console.log('User registered:', email);

        // Send welcome email
        try {
            await transporter.sendMail({
                from: `"RP Sports Booking" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Welcome to RP Sports Booking System!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                        <div style="background-color: #1a4d2e; padding: 20px; text-align: center;">
                            <h2 style="color: white; margin: 0;">RP Sports Booking</h2>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h3 style="color: #1a4d2e;">Welcome, ${name}! 🎉</h3>
                            <p>Your account has been successfully created.</p>
                            <div style="background: #e8f5e8; border-radius: 8px; 
                                        padding: 16px; margin: 16px 0;">
                                <p style="margin:0;"><strong>Email:</strong> ${email}</p>
                            </div>
                            <p>You can now login and start booking 
                               RP Sports facilities!</p>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="http://localhost:3000/login"
                                   style="background-color: #1a4d2e; color: white;
                                          padding: 12px 30px; border-radius: 8px;
                                          text-decoration: none; font-weight: bold;">
                                    Login Now
                                </a>
                            </div>
                        </div>
                        <div style="background-color: #1a4d2e; padding: 15px; text-align: center;">
                            <p style="color: white; margin: 0; font-size: 12px;">
                                © 2026 RP Sports Booking System | Republic Polytechnic
                            </p>
                        </div>
                    </div>
                `
            });
            console.log('Welcome email sent successfully to:', email);
        } catch (emailErr) {
            console.log('Email sending failed:', emailErr.message);
        }

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { message: 'Something went wrong!' });
    }
});

// GET Login page
router.get('/login', (req, res) => {
    res.render('login', { message: null });
});

// POST Login
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

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// GET - Forgot Password page
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', { message: null });
});

// POST - Send reset code
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return res.render('forgotPassword', {
                message: 'Email not found in our system!'
            });
        }

        const resetCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
            'UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?',
            [resetCode, expiry, email]
        );

        try {
            await transporter.sendMail({
                from: `"RP Sports Booking" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset Code - RP Sports Booking',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                        <div style="background-color: #1a4d2e; padding: 20px; text-align: center;">
                            <h2 style="color: white; margin: 0;">RP Sports Booking</h2>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9;">
                            <h3 style="color: #1a4d2e;">Password Reset Request</h3>
                            <p>You requested to reset your password.</p>
                            <p>Your 6-digit verification code is:</p>
                            <div style="background: #1a4d2e; color: white; 
                                        font-size: 32px; font-weight: bold; 
                                        text-align: center; padding: 20px; 
                                        border-radius: 8px; letter-spacing: 8px;">
                                ${resetCode}
                            </div>
                            <p style="color: #666; margin-top: 20px;">
                                This code expires in <strong>15 minutes</strong>.
                            </p>
                            <p style="color: #666;">
                                If you did not request this, 
                                please ignore this email.
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
            console.log('Reset code email sent to:', email);
        } catch (emailErr) {
            console.log('Reset email error:', emailErr.message);
        }

        req.session.resetEmail = email;
        res.redirect('/verify-code');

    } catch (err) {
        console.error(err);
        res.render('forgotPassword', {
            message: 'Something went wrong! Please try again.'
        });
    }
});

// GET - Verify code page
router.get('/verify-code', (req, res) => {
    if (!req.session.resetEmail) {
        return res.redirect('/forgot-password');
    }
    res.render('verifyCode', { message: null });
});

// POST - Verify code
router.post('/verify-code', async (req, res) => {
    const { code } = req.body;
    const email = req.session.resetEmail;

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND reset_code = ?',
            [email, code]
        );

        if (users.length === 0) {
            return res.render('verifyCode', {
                message: 'Invalid code! Please try again.'
            });
        }

        const user = users[0];
        const now = new Date();
        const expiry = new Date(user.reset_code_expiry);

        if (now > expiry) {
            return res.render('verifyCode', {
                message: 'Code has expired! Please request a new one.'
            });
        }

        req.session.resetVerified = true;
        res.redirect('/reset-password');

    } catch (err) {
        console.error(err);
        res.render('verifyCode', {
            message: 'Something went wrong! Please try again.'
        });
    }
});

// GET - Reset password page
router.get('/reset-password', (req, res) => {
    if (!req.session.resetEmail || !req.session.resetVerified) {
        return res.redirect('/forgot-password');
    }
    res.render('resetPassword', { message: null });
});

// POST - Reset password
router.post('/reset-password', async (req, res) => {
    const { password, confirmPassword } = req.body;
    const email = req.session.resetEmail;

    if (password !== confirmPassword) {
        return res.render('resetPassword', {
            message: 'Passwords do not match!'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'UPDATE users SET password = ?, reset_code = NULL, reset_code_expiry = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        delete req.session.resetEmail;
        delete req.session.resetVerified;

        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.render('resetPassword', {
            message: 'Something went wrong! Please try again.'
        });
    }
});


module.exports = router;