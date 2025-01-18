const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const storage = multer.diskStorage({  
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log("MYSQL connected....");
});

exports.getBucketList = (req, res) => {
    const userId = req.session.user.id;

    db.query('SELECT * FROM bucket_list_items WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching bucket list items');
        }

        res.render('bucketList', {
            items: results
        });
    });
};

exports.addItem = (req, res) => {
    const { name } = req.body;
    const userId = req.session.user.id;

    db.query('INSERT INTO bucket_list_items (name, user_id) VALUES (?, ?)', [name, userId], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/bucket');
        }
    });
};


exports.addStory = (req, res) => {
    const { id } = req.params; 
    const { story } = req.body; 

    db.query('UPDATE bucket_list_items SET story = ? WHERE id = ?', [story, id], (err, results) => {
        if (err) {
            console.error('Error updating story:', err); 
            res.status(500).send('Error updating story'); 
        } else {
            console.log('Story updated successfully:', results);
            res.redirect('/bucket'); 
        }
    });
};



exports.deleteItem = (req, res) => {
    const { id } = req.params;
    db.query('SELECT image_url FROM bucket_list_items WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving image information.');
        }

        if (results.length > 0 && results[0].image_url) {
            const imagePath = path.join(__dirname, '..', 'uploads', path.basename(results[0].image_url));

            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting image file:', unlinkErr);
                } else {
                    console.log('Image file deleted successfully.');
                }

                db.query('DELETE FROM bucket_list_items WHERE id = ?', [id], (deleteErr) => {
                    if (deleteErr) {
                        console.error(deleteErr);
                        return res.status(500).send('Error deleting item from the database.');
                    }
                    res.redirect('/bucket');
                });
            });
        } else {
           
            db.query('DELETE FROM bucket_list_items WHERE id = ?', [id], (deleteErr) => {
                if (deleteErr) {
                    console.error(deleteErr);
                    return res.status(500).send('Error deleting item from the database.');
                }
                res.redirect('/bucket');
            });
        }
    });
};
exports.checkItem = (req, res) => {
    const { id } = req.params;
    const { is_checked } = req.body;

    db.query('UPDATE bucket_list_items SET checked = ? WHERE id = ?', [is_checked === 'on', id], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/bucket');
        }
    });
};

exports.uploadImage = [upload.single('image'), (req, res) => {
    const { id } = req.params;
    const imageUrl = `/uploads/${req.file.filename}`;

    db.query('UPDATE bucket_list_items SET image_url = ? WHERE id = ?', [imageUrl, id], (err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/bucket');
        }
    });
}];

exports.getImages = (req, res) => {
    const userId = req.session.user.id; 
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }

    const query = 'SELECT image_url FROM bucket_list_items WHERE user_id = ?';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching images');
        }
        const imageUrls = results.map(result => result.image_url);
        res.json(imageUrls);
    });
};  



exports.fetchBucketListItems = (req, res) => {
    const query = `
        SELECT b.name AS item_name, b.image_url, b.story, u.name AS user_name
        FROM bucket_list_items b
        JOIN user u ON b.user_id = u.id
        WHERE b.image_url IS NOT NULL AND b.story IS NOT NULL
        `
    ;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching bucket list items:', err);
            return res.status(500).send('Error fetching bucket list items');
        }
        if (results.length === 0) {
            return res.status(404).send('No bucket list items found');
        }
        res.render('stories', { items: results });
    });
};







