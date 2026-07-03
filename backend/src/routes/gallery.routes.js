const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', galleryController.getAllGallery);
router.post('/', verifyToken, isAdmin, galleryController.createGalleryItem);
router.put('/:id', verifyToken, isAdmin, galleryController.updateGalleryItem);
router.delete('/:id', verifyToken, isAdmin, galleryController.deleteGalleryItem);

module.exports = router;
