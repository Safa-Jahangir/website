// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('🛒 Sparkling Kidzone API is running');
});

// ✅ Checkout route
app.post('/checkout', (req, res) => {
  const { customerName, email, phone, address, paymentMethod, items } = req.body;

  if (!customerName || !email || !phone || !address || !paymentMethod || !items) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO orders (customerName, email, phone, address, paymentMethod, items, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [customerName, email, phone, address, paymentMethod, items, 'Pending'];

  db.run(query, values, function (err) {
    if (err) {
      console.error('❌ DB error inserting order:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('✅ Order placed with ID:', this.lastID);
    res.json({ success: true, orderId: this.lastID });
  });
});

// ✅ Get all orders (for admin dashboard)
app.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch orders:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

// ✅ Update order status (deliver/update)
app.put('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        console.error('❌ Failed to update order:', err.message);
        return res.status(500).json({ message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log(`✅ Order ${id} updated to: ${status}`);
      res.json({ success: true, orderId: id, newStatus: status });
    }
  );
});

// ✅ Get all products (used by frontend to display items)
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch products:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(rows);
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
