-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName TEXT,
  items TEXT,
  paymentMethod TEXT
);

-- Insert some sample products
INSERT INTO products (name, price) VALUES ("Toy Car", 150);
INSERT INTO products (name, price) VALUES ("Doll", 200);
INSERT INTO products (name, price) VALUES ("Puzzle", 100);
