const db = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

// Retrieve categories
const getCategories = async (req, res) => {
  const { all } = req.query; // If all=true, retrieve inactive categories too (for admin panel)

  try {
    let queryText = 'SELECT * FROM categories';
    if (all !== 'true') {
      queryText += ' WHERE is_active = TRUE';
    }
    queryText += ' ORDER BY sort_order ASC, name_en ASC';

    const result = await db.query(queryText);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Server error fetching categories.' });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  const { name_en, name_am, image_url, sort_order, is_active } = req.body;

  if (!name_en || !name_am) {
    return res.status(400).json({ message: 'Category English and Amharic names are required.' });
  }

  // Generate unique slug from English name
  const slug = slugify(name_en);

  try {
    // Check if category with this slug already exists
    const checkSlug = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    if (checkSlug.rows.length > 0) {
      return res.status(400).json({ message: `Category with name '${name_en}' already exists.` });
    }

    const result = await db.query(
      `INSERT INTO categories (slug, name_en, name_am, image_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        slug,
        name_en,
        name_am,
        image_url || '',
        parseInt(sort_order || 0),
        is_active === undefined ? true : !!is_active
      ]
    );

    return res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Server error creating category.' });
  }
};

// Update an existing category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name_en, name_am, image_url, sort_order, is_active } = req.body;

  try {
    // Check if category exists
    const checkCat = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (checkCat.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const existingCat = checkCat.rows[0];
    const newSlug = name_en ? slugify(name_en) : existingCat.slug;

    // Check slug uniqueness if it changed
    if (newSlug !== existingCat.slug) {
      const checkSlug = await db.query('SELECT * FROM categories WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (checkSlug.rows.length > 0) {
        return res.status(400).json({ message: `Category with name '${name_en}' already exists.` });
      }
    }

    const result = await db.query(
      `UPDATE categories SET 
        slug = $1, name_en = $2, name_am = $3, image_url = $4, sort_order = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [
        newSlug,
        name_en || existingCat.name_en,
        name_am || existingCat.name_am,
        image_url !== undefined ? image_url : existingCat.image_url,
        parseInt(sort_order !== undefined ? sort_order : existingCat.sort_order),
        is_active === undefined ? existingCat.is_active : !!is_active,
        id
      ]
    );

    return res.status(200).json({
      message: 'Category updated successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Server error updating category.' });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if category exists
    const checkCat = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (checkCat.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const category = checkCat.rows[0];

    // Check if any products are associated with this category slug
    const checkProducts = await db.query('SELECT COUNT(*) as count FROM products WHERE category = $1', [category.slug]);
    const productCount = parseInt(checkProducts.rows[0].count);

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category '${category.name_en}' because it contains ${productCount} products. Re-assign or delete those products first.`
      });
    }

    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return res.status(200).json({
      message: 'Category deleted successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Server error deleting category.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
