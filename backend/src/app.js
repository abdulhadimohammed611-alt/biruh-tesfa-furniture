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

// ---------------------------------------------------------------------------
// CORS — allow all origins listed in FRONTEND_URL (comma-separated list
// supported for multiple deployments e.g. Vercel + custom domain).
// Falls back to allowing any origin in development.
// ---------------------------------------------------------------------------
const rawFrontendUrl = process.env.FRONTEND_URL || '';
const allowedOrigins = rawFrontendUrl
  ? rawFrontendUrl.split(',').map((u) => u.trim()).filter(Boolean)
  : null; // null → allow all (development only)

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, cb) => {
          // Allow requests with no origin (server-to-server, curl, etc.)
          if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
          } else {
            cb(new Error(`CORS blocked: origin '${origin}' is not allowed.`));
          }
        }
      : '*',
    credentials: true,
  })
);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve uploads folder statically (local dev fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---------------------------------------------------------------------------
// File upload endpoint — returns a publicly accessible URL.
// Uses BACKEND_URL in production so the URL is never hardcoded to localhost.
// ---------------------------------------------------------------------------
app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // If Cloudinary was used (multer-storage-cloudinary sets req.file.path to
  // the Cloudinary secure URL). Otherwise build a URL from BACKEND_URL.
  const fileUrl = req.file.path && req.file.path.startsWith('http')
    ? req.file.path
    : `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;

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

// ---------------------------------------------------------------------------
// Health check — GET /health
// Render uses this path by default to verify the service is alive.
// Must respond with 200 quickly; no DB round-trip so it never fails due to DB lag.
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Detailed health check — GET /api/health
// Includes a live DB connectivity test; useful for monitoring dashboards.
app.get('/api/health', async (req, res) => {
  try {
    await db.testConnection();
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
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
  console.log(`BIRUH TESFA Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed CORS origins: ${allowedOrigins ? allowedOrigins.join(', ') : 'ALL (dev mode)'}`);
});

module.exports = app;
