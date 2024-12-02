const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Login
router.get('/login', (req, res) => {
    res.render('login', {
        layout: 'layouts/userAuth-layout',
        title: 'Login',
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.password === password) {
            req.session.userId = user._id;
            req.session.nama = user.nama;
            req.session.role = user.role;
            res.redirect('/');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Register
router.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/userAuth-layout',
        title: 'Register',
    });
});

router.post('/register', async (req, res) => {
    const { nama, email, password, lahir, alamat, role } = req.body;
    try {
        const user = new User({ nama, email, password, lahir, alamat, role });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/login');
    });
});

module.exports = router;
