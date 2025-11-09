-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalesTransaction" ENABLE ROW LEVEL SECURITY;

-- Create auth function to get user_id from JWT
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$ LANGUAGE sql STABLE;

-- Create auth function to get user role
CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$
  SELECT coalesce(
    current_setting('request.jwt.claim.role', true),
    'authenticated'
  )::text
$$ LANGUAGE sql STABLE;

-- User policies
CREATE POLICY "Users can view their own data" ON "User"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON "User"
  FOR UPDATE USING (auth.uid() = id);

-- Product policies
CREATE POLICY "Users can view all products" ON "Product"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Managers can modify products" ON "Product"
  FOR ALL TO authenticated USING (
    auth.role() IN ('ADMIN', 'MANAGER')
  );

-- Inventory policies
CREATE POLICY "Users can view inventory items" ON "InventoryItem"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Managers can modify inventory" ON "InventoryItem"
  FOR ALL TO authenticated USING (
    auth.role() IN ('ADMIN', 'MANAGER')
  );

-- Sales Transaction policies
CREATE POLICY "Users can view sales transactions" ON "SalesTransaction"
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create sales transactions" ON "SalesTransaction"
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);