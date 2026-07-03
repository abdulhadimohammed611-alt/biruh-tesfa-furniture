const db = require('../config/db');

const addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const userId = req.user.id;
  const userName = req.user.name || 'Anonymous Customer';

  if (!product_id || !rating) {
    return res.status(400).json({ message: 'Product ID and rating are required.' });
  }

  const ratingVal = parseInt(rating);
  if (ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert review
    const reviewResult = await client.query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [product_id, userId, userName, ratingVal, comment]
    );

    // 2. Recalculate average rating for product
    const avgResult = await client.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = $1',
      [product_id]
    );

    const newAvg = parseFloat(avgResult.rows[0].avg_rating || 0).toFixed(2);

    // 3. Update products table
    await client.query(
      'UPDATE products SET rating_avg = $1 WHERE id = $2',
      [newAvg, product_id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Review added successfully',
      review: reviewResult.rows[0],
      new_rating_avg: newAvg
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add review error:', error);
    return res.status(500).json({ message: 'Server error adding review.' });
  } finally {
    client.release();
  }
};

const getProductReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [product_id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return res.status(500).json({ message: 'Server error fetching reviews.' });
  }
};

module.exports = {
  addReview,
  getProductReviews
};
