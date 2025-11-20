-- Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ok',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order table
CREATE TABLE IF NOT EXISTS "Order" (
  id SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(50) UNIQUE NOT NULL,
  "tableNumber" INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  "totalPrice" DECIMAL(10, 2) DEFAULT 0,
  "paymentMethod" VARCHAR(50),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItem table
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "productName" VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER UNIQUE NOT NULL REFERENCES "Order"(id),
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user with bcrypt hashed password for admin12345
INSERT INTO "Admin" (email, password, name)
VALUES (
  'admin@fonzi.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36UxQpIm',
  'Administrador'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products for the cafeteria menu
INSERT INTO "Product" (name, category, price, stock, status)
VALUES
  ('Café Americano', 'Bebidas', 2.50, 50, 'ok'),
  ('Café Latte', 'Bebidas', 3.00, 45, 'ok'),
  ('Capuchino', 'Bebidas', 3.50, 40, 'ok'),
  ('Sándwich Jamón', 'Alimentos', 5.00, 30, 'ok'),
  ('Muffin Chocolate', 'Alimentos', 2.00, 25, 'bajo'),
  ('Pan Brioche', 'Alimentos', 1.50, 10, 'bajo'),
  ('Leche Entera', 'Insumos', 1.00, 100, 'ok')
ON CONFLICT DO NOTHING;
