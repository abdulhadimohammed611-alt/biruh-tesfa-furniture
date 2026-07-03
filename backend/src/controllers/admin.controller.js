const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Core totals
    const userCountRes = await db.query('SELECT COUNT(*) as count FROM users');
    const productCountRes = await db.query('SELECT COUNT(*) as count FROM products');
    const orderCountRes = await db.query('SELECT COUNT(*) as count FROM orders');
    
    // 2. Financials (grouped by currency)
    const revenueRes = await db.query(`
      SELECT currency, SUM(total_amount) as total
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY currency
    `);

    // 3. Category distribution
    const categoryDistRes = await db.query(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
    `);

    // 4. Recent orders
    const recentOrdersRes = await db.query(`
      SELECT o.*, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // 5. Monthly Sales chart data (last 6 months)
    const salesChartRes = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month, 
        currency,
        SUM(total_amount) as sales,
        COUNT(id) as orders_count
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), currency
      ORDER BY month ASC
    `);

    // Construct response object
    const stats = {
      counts: {
        users: parseInt(userCountRes.rows[0].count),
        products: parseInt(productCountRes.rows[0].count),
        orders: parseInt(orderCountRes.rows[0].count)
      },
      revenue: {
        USD: 0,
        ETB: 0
      },
      categories: categoryDistRes.rows.reduce((acc, row) => {
        acc[row.category] = parseInt(row.count);
        return acc;
      }, {}),
      recentOrders: recentOrdersRes.rows,
      salesChart: salesChartRes.rows
    };

    revenueRes.rows.forEach(row => {
      stats.revenue[row.currency] = parseFloat(row.total || 0);
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return res.status(500).json({ message: 'Server error generating dashboard analytics.' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return res.status(500).json({ message: 'Server error fetching all orders.' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { order_status } = req.body; // 'processing', 'packed', 'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'

  if (!order_status) {
    return res.status(400).json({ message: 'Order status is required.' });
  }

  const validStatuses = ['processing', 'packed', 'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(order_status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const result = await db.query(
      'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *',
      [order_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error updating order status.' });
  }
};

const updateOrderPaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body; // 'pending', 'paid', 'failed'

  if (!payment_status) {
    return res.status(400).json({ message: 'Payment status is required.' });
  }

  try {
    const result = await db.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
      [payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({
      message: 'Payment status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ message: 'Server error updating payment status.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return res.status(500).json({ message: 'Server error fetching all users.' });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'customer' or 'admin'

  if (!role) {
    return res.status(400).json({ message: 'Role is required.' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, phone',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ message: 'Server error updating user role.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getAllUsers,
  updateUserRole
};
