const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const upload = require('./middleware/upload');
const { verifyToken, isAdmin } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reviewRoutes = require('./routes/review.routes');
const galleryRoutes = require('./routes/gallery.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/category.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Simple file upload endpoint (Admin protected or user protected)
app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return URL relative to this server
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  return res.status(200).json({
    message: 'File uploaded successfully',
    url: fileUrl
  });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW()');
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: dbTest.rows[0].now
    });
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server!'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`BIRUH TESFA Backend running on http://localhost:${PORT}`);
});

module.exports = app;
