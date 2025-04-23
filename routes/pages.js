const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware'); // import your middleware
const mysql = require("mysql2");

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/explore', (req, res) => {
    res.render('explore');
});

router.get('/bucketList', verifyToken, (req, res) => {
    res.render('bucketList', { user: req.user });
});

router.get('/user', verifyToken, (req, res) => {
    res.render('user', {
        message: 'User page',
        user: req.user
    });
});


router.get("/profile", verifyToken, (req, res) => {
    const db = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    });

    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [req.user.email], (err, results) => {
        if (err || results.length === 0) return res.redirect("/login");

        const user = results[0];
        res.render("profile", { user });
    });
});

router.get('/story', verifyToken, (req, res) => {
    res.render('story');
});

router.get('/stories', verifyToken, (req, res) => {
    res.render('stories');
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

router.get('/itinerary', verifyToken, (req, res) => {
    res.render('itinerary', { user: req.user });
});


module.exports = router;
