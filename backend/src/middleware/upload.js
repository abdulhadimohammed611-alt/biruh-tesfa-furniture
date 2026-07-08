const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ---------------------------------------------------------------------------
// File type filter — shared by both storage strategies
// ---------------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (.jpg, .jpeg, .png, .webp, .gif) are allowed!'));
};

let upload;

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  // ---------------------------------------------------------------------------
  // PRODUCTION: Upload to Cloudinary
  // Images are served from Cloudinary's CDN — no local disk dependency.
  // ---------------------------------------------------------------------------
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'biruh-tesfa-furniture',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  });

  upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
  });

  console.log('Upload storage: Cloudinary (production)');
} else {
  // ---------------------------------------------------------------------------
  // DEVELOPMENT: Save to local uploads/ directory
  // ---------------------------------------------------------------------------
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage: diskStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
  });

  console.log('Upload storage: Local disk (development)');
}

module.exports = upload;
