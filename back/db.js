// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file (persistent storage)
const dbPath = path.resolve(__dirname, 'store.db');
const db = new sqlite3.Database(dbPath);

// ✅ Initialize tables
db.serialize(() => {
  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      items TEXT NOT NULL,
      status TEXT DEFAULT 'Pending'
    )
  `);

  // ✅ Seed products if empty
  db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
    if (err) {
      console.error("❌ Error checking products table:", err.message);
      return;
    }
    if (row.count === 0) {
      console.log("🌱 Seeding products table...");
      const stmt = db.prepare(`
        INSERT INTO products (name, price, description, image)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run("Red T-Shirt", 15.99, "Comfortable cotton t-shirt", "images/red-tshirt.jpg");
      stmt.run("Blue Jeans", 29.99, "Stylish denim jeans", "images/blue-jeans.jpg");
      stmt.run("Kids Sneakers", 24.50, "Durable and comfy sneakers", "images/sneakers.jpg");
      stmt.run("School Backpack", 18.75, "Spacious backpack for kids", "images/backpack.jpg");

      stmt.finalize();
      console.log("✅ Products seeded successfully.");
    }
  });
});

module.exports = db;
