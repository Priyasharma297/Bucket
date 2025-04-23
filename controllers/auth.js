const jwt = require('jsonwebtoken');
const mysql = require("mysql2");
require('dotenv').config();
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary config from cloudinary.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

// REGISTER
exports.register = (req, res) => {
    const { name, email, password, passwordConfirmed } = req.body;

    db.query('SELECT email FROM user WHERE email=?', [email], async (error, results) => {
        if (error) return console.log(error);

        if (results.length > 0) {
            return res.render('register', { message: 'Email is already in use , use another....' });
        }

        if (password !== passwordConfirmed) {
            return res.render('register', { message: 'Password do not match !!' });
        }

        db.query('INSERT INTO user SET ?', { name, email, password }, (error, results) => {
            if (error) return console.log(error);
            return res.render('register', { message: 'User registered' });
        });
    });
};

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).send('Internal Server Error');
        if (results.length === 0 || results[0].password !== password) {
            return res.render('login', { message: 'Email or password is incorrect' });
        }

        const user = results[0];
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

        res.cookie('token', token, { httpOnly: true });
        return res.render('user', { message: 'Login successful', user });
    });
};

// PROFILE UPDATE
exports.updateProfile = [
    upload.single('image'), // Handle image upload
    (req, res) => {
        const { address, city, mobile, age, gender } = req.body;
        const user = req.user; // Retrieved from JWT middleware

        // Check if there is an image to upload
        let profileImageUrl = null;
        if (req.file) {
            cloudinary.uploader.upload_stream(
                { folder: 'user_profiles' },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({ success: false, message: 'Image upload failed' });
                    }
                    profileImageUrl = result.secure_url;
                    // Proceed to update the profile data
                    updateUserProfile(address, city, mobile, age, gender, profileImageUrl, user.email, res);
                }
            ).end(req.file.buffer);
        } else {
            // Proceed without updating the image
            updateUserProfile(address, city, mobile, age, gender, profileImageUrl, user.email, res);
        }
    }
];

// Helper function to update profile in DB
function updateUserProfile(address, city, mobile, age, gender, profileImageUrl, email, res) {
    const query = 'UPDATE user SET address = ?, city = ?, mobile = ?, age = ?, gender = ?, profileImage = ? WHERE email = ?';
    const params = [address, city, mobile, age, gender, profileImageUrl || null, email];

    db.query(query, params, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false });
        }
        return res.json({ success: true });
    });
}