-- Add unit system to products table
ALTER TABLE products 
  RENAME COLUMN price TO base_price;

ALTER TABLE products 
  ADD COLUMN unit_type VARCHAR(50) DEFAULT 'individual' NOT NULL,
  ADD COLUMN min_quantity INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN max_quantity INTEGER DEFAULT 100 NOT NULL;

-- Create product_units table
CREATE TABLE product_units (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_product_units_product_id ON product_units(product_id);
CREATE INDEX idx_product_units_is_default ON product_units(is_default);
CREATE INDEX idx_product_units_sort_order ON product_units(sort_order);
