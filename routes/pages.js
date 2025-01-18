const express = require('express');
const router = express.Router();
const authController = require('./auth'); 
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

router.get('/bucketList', (req, res) => {
    res.render('bucketList');
});

router.get('/user', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    res.render('user', {
        message: 'User page',
        user: user
    });
});

router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    res.render('profile', {
        message: 'Profile page',
        user: user
    });
});

router.get('/story', (req, res) => {
    res.render('story');
});

router.get('/stories', (req, res) => {
    res.render('stories');
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
            return next(err);
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login'); 
    });
});

router.get('/itinerary', (req, res) => {
    res.render('itinerary'); 
});

module.exports = router;
