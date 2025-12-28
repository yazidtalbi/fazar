-- Enable Row Level Security
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Buyer Profiles: Users can read/update their own profile
CREATE POLICY "Users can view their own buyer profile"
  ON buyer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own buyer profile"
  ON buyer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own buyer profile"
  ON buyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Seller Profiles: Users can read/update their own profile, public can see verified status
CREATE POLICY "Users can view their own seller profile"
  ON seller_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own seller profile"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own seller profile"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Stores: Public can view, sellers can update their own
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Sellers can update their own store"
  ON stores FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Categories: Public read access
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Products: Public can view active products, sellers can manage their own
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Store owners can view all their products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert their own products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their own products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Product Media: Public can view media for active products, sellers can manage their own
CREATE POLICY "Anyone can view media for active products"
  ON product_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_media.product_id
      AND products.status = 'active'
    )
  );

CREATE POLICY "Store owners can view media for their products"
  ON product_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN stores ON stores.id = products.store_id
      WHERE products.id = product_media.product_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage media for their products"
  ON product_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN stores ON stores.id = products.store_id
      WHERE products.id = product_media.product_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Orders: Buyers can view/manage their own orders
CREATE POLICY "Buyers can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM order_items
      JOIN products ON products.id = order_items.product_id
      JOIN stores ON stores.id = products.store_id
      WHERE order_items.order_id = orders.id
      AND stores.seller_id = auth.uid()
    )
  );

-- Order Items: Buyers and sellers can view relevant order items
CREATE POLICY "Buyers can view items in their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can view items for their products"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN stores ON stores.id = products.store_id
      WHERE products.id = order_items.product_id
      AND stores.seller_id = auth.uid()
    )
  );

-- Cart Items: Users can manage their own cart
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can manage their own cart items"
  ON cart_items FOR ALL
  USING (auth.uid() = buyer_id);

