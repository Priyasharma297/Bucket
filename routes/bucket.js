const express = require('express');
const router = express.Router();
const bucketController = require('../controllers/bucket');

router.get('/', bucketController.getBucketList);
router.post('/add', bucketController.addItem);
router.post('/delete/:id', bucketController.deleteItem);
router.post('/check/:id', bucketController.checkItem);
router.post('/upload/:id', bucketController.uploadImage);
router.post('/addstory/:id',bucketController.addStory);
router.get('/images', bucketController.getImages);
router.get('/stories', bucketController.fetchBucketListItems);

module.exports = router;
