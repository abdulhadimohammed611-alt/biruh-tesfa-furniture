const db = require('../config/db');

const getAllGallery = async (req, res) => {
  const { all } = req.query; // If 'true', show unpublished posts too (admin mode)
  try {
    let queryText = 'SELECT * FROM gallery';
    if (all !== 'true') {
      queryText += ' WHERE is_published = TRUE';
    }
    queryText += ' ORDER BY sort_order ASC, created_at DESC';
    
    const result = await db.query(queryText);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch gallery error:', error);
    return res.status(500).json({ message: 'Server error fetching gallery posts.' });
  }
};

const createGalleryItem = async (req, res) => {
  const { title_en, title_am, image_url, description_en, description_am, sort_order, is_published } = req.body;

  if (!title_en || !title_am || !image_url) {
    return res.status(400).json({ message: 'Title (EN & AM) and image URL are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO gallery (title_en, title_am, image_url, description_en, description_am, sort_order, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title_en,
        title_am,
        image_url,
        description_en,
        description_am,
        parseInt(sort_order || 0),
        is_published === undefined ? true : !!is_published
      ]
    );

    return res.status(201).json({
      message: 'Gallery item created successfully',
      gallery: result.rows[0]
    });
  } catch (error) {
    console.error('Create gallery item error:', error);
    return res.status(500).json({ message: 'Server error creating gallery item.' });
  }
};

const updateGalleryItem = async (req, res) => {
  const { id } = req.params;
  const { title_en, title_am, image_url, description_en, description_am, sort_order, is_published } = req.body;

  try {
    // Check if gallery item exists
    const checkItem = await db.query('SELECT * FROM gallery WHERE id = $1', [id]);
    if (checkItem.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    const existing = checkItem.rows[0];

    const result = await db.query(
      `UPDATE gallery SET 
        title_en = $1, title_am = $2, image_url = $3, description_en = $4, description_am = $5, sort_order = $6, is_published = $7
       WHERE id = $8
       RETURNING *`,
      [
        title_en !== undefined ? title_en : existing.title_en,
        title_am !== undefined ? title_am : existing.title_am,
        image_url !== undefined ? image_url : existing.image_url,
        description_en !== undefined ? description_en : existing.description_en,
        description_am !== undefined ? description_am : existing.description_am,
        parseInt(sort_order !== undefined ? sort_order : existing.sort_order),
        is_published === undefined ? existing.is_published : !!is_published,
        id
      ]
    );

    return res.status(200).json({
      message: 'Gallery item updated successfully',
      gallery: result.rows[0]
    });
  } catch (error) {
    console.error('Update gallery item error:', error);
    return res.status(500).json({ message: 'Server error updating gallery item.' });
  }
};

const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM gallery WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gallery item not found.' });
    }

    return res.status(200).json({ message: 'Gallery item deleted successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return res.status(500).json({ message: 'Server error deleting gallery item.' });
  }
};

module.exports = {
  getAllGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
