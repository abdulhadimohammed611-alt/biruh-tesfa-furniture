const db = require('../config/db');

const getAllProducts = async (req, res) => {
  const { category, sub_category, search, price_min, price_max, sort, currency } = req.query;
  
  try {
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filters
    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (sub_category) {
      queryText += ` AND sub_category = $${paramIndex}`;
      params.push(sub_category);
      paramIndex++;
    }

    if (search) {
      // Supports case-insensitive searching in both English and Amharic columns
      queryText += ` AND (name_en ILIKE $${paramIndex} OR name_am ILIKE $${paramIndex} OR description_en ILIKE $${paramIndex} OR description_am ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (price_min) {
      const priceCol = currency === 'ETB' ? 'price_etb' : 'price_usd';
      queryText += ` AND ${priceCol} >= $${paramIndex}`;
      params.push(parseFloat(price_min));
      paramIndex++;
    }

    if (price_max) {
      const priceCol = currency === 'ETB' ? 'price_etb' : 'price_usd';
      queryText += ` AND ${priceCol} <= $${paramIndex}`;
      params.push(parseFloat(price_max));
      paramIndex++;
    }

    // Sorting
    let orderBy = ' ORDER BY created_at DESC'; // default
    if (sort) {
      const priceCol = currency === 'ETB' ? 'price_etb' : 'price_usd';
      if (sort === 'price_asc') {
        orderBy = ` ORDER BY ${priceCol} ASC`;
      } else if (sort === 'price_desc') {
        orderBy = ` ORDER BY ${priceCol} DESC`;
      } else if (sort === 'rating') {
        orderBy = ' ORDER BY rating_avg DESC';
      }
    }
    
    queryText += orderBy;

    const result = await db.query(queryText, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ message: 'Server error fetching products.' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const productResult = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const product = productResult.rows[0];

    // Fetch reviews for this product
    const reviewsResult = await db.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
      [id]
    );

    return res.status(200).json({
      ...product,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error('Fetch product by ID error:', error);
    return res.status(500).json({ message: 'Server error fetching product details.' });
  }
};

const createProduct = async (req, res) => {
  const {
    name_en, name_am, description_en, description_am,
    price_usd, price_etb, category, sub_category,
    images, features_en, features_am, dimensions_en, dimensions_am,
    stock
  } = req.body;

  if (!name_en || !name_am || !description_en || !description_am || !price_usd || !price_etb || !category || !images) {
    return res.status(400).json({ message: 'Missing required product fields.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (
        name_en, name_am, description_en, description_am,
        price_usd, price_etb, category, sub_category,
        images, features_en, features_am, dimensions_en, dimensions_am,
        stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        name_en, name_am, description_en, description_am,
        parseFloat(price_usd), parseFloat(price_etb), category, sub_category,
        images, features_en || [], features_am || [], dimensions_en, dimensions_am,
        parseInt(stock || 10)
      ]
    );

    return res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Server error creating product.' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name_en, name_am, description_en, description_am,
    price_usd, price_etb, category, sub_category,
    images, features_en, features_am, dimensions_en, dimensions_am,
    stock
  } = req.body;

  try {
    // Check product exists
    const checkProduct = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkProduct.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const result = await db.query(
      `UPDATE products SET 
        name_en = $1, name_am = $2, description_en = $3, description_am = $4,
        price_usd = $5, price_etb = $6, category = $7, sub_category = $8,
        images = $9, features_en = $10, features_am = $11, dimensions_en = $12, dimensions_am = $13,
        stock = $14
       WHERE id = $15
       RETURNING *`,
      [
        name_en, name_am, description_en, description_am,
        parseFloat(price_usd), parseFloat(price_etb), category, sub_category,
        images, features_en || [], features_am || [], dimensions_en, dimensions_am,
        parseInt(stock || 0),
        id
      ]
    );

    return res.status(200).json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Server error updating product.' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Server error deleting product.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
