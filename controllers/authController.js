const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.loginForm = (req, res) => {
    res.render('login', {
        layout: 'layouts/userAuth-layout',
        title: 'Login',
    });
};
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userAuth = await User.findOne({ email });
        if (userAuth && await bcrypt.compare(password, userAuth.password)) {
            req.session.userId = userAuth._id;
            req.session.nama = userAuth.nama;
            res.redirect('/');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
};
exports.registerForm = (req, res) => {
    res.render('register', {
        layout: 'layouts/userAuth-layout',
        title: 'Register',
    });
};

exports.register = async (req, res) => {
    const { nama, email, password, lahir, alamat, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userAuth = new User({ nama, email, password: hashedPassword, lahir, alamat, role });
        await userAuth.save();
        res.redirect('/login');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
};
