const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const User = require('../models/userModel');  // MongoDB User model
=======
const mysql = require("mysql2");
require('dotenv').config();
>>>>>>> 7d350b1cf75121bfbecaf8bf7eca785881a29961
const cloudinary = require('../utils/cloudinary'); // Import Cloudinary config from cloudinary.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
<<<<<<< HEAD

// REGISTER
exports.register = async (req, res) => {
    const { name, email, password, passwordConfirmed } = req.body;

    try {
        // Check if the email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { message: 'Email is already in use, use another one.' });
        }

        // Check if passwords match
        if (password !== passwordConfirmed) {
            return res.render('register', { message: 'Password does not match!' });
        }

        // Create a new user and save to MongoDB
        const newUser = new User({ name, email, password });
        await newUser.save();

        return res.render('register', { message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// LOGIN
// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.render('login', { message: 'Email or password is incorrect' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

        // Set token in cookie
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 1000 * 60 * 60 * 24 });

        return res.render('user', { message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};


// PROFILE UPDATE
exports.updateProfile = [
    upload.single('image'), // Handle image upload
    async (req, res) => {
        const { address, city, mobile, age, gender } = req.body;
        const user = req.user; // Retrieved from JWT middleware

        let profileImageUrl = null;

        try {
            // If there is an image, upload it to Cloudinary
            if (req.file) {
                profileImageUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'user_profiles' },
                        (error, result) => {
                            if (error) return reject(new Error('Image upload failed'));
                            resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
            }

            // Update the user's profile in MongoDB
            await updateUserProfile(address, city, mobile, age, gender, profileImageUrl, user.email);

            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
=======
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
>>>>>>> 7d350b1cf75121bfbecaf8bf7eca785881a29961
        }
    }
];

<<<<<<< HEAD
// Helper function to update profile in MongoDB
async function updateUserProfile(address, city, mobile, age, gender, profileImageUrl, email) {
    try {
        await User.updateOne(
            { email },
            {
                $set: {
                    address,
                    city,
                    mobile,
                    age,
                    gender,
                    ...(profileImageUrl && { profileImage: profileImageUrl }) // only update if image exists
                }
            }
        );
    } catch (error) {
        throw new Error('Error updating user profile');
    }
}
=======
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
>>>>>>> 7d350b1cf75121bfbecaf8bf7eca785881a29961
