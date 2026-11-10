-- ==========================================
-- EXPENSE TRACKER DEFAULT CATEGORY SEED DATA
-- ==========================================

INSERT INTO default_categories (name, color, icon) VALUES
('Food', '#F97316', 'utensils'),
('Shopping', '#EC4899', 'shopping-bag'),
('Travel', '#3B82F6', 'plane'),
('Transportation', '#06B6D4', 'car'),
('Bills & Utilities', '#EAB308', 'receipt'),
('Education', '#8B5CF6', 'graduation-cap'),
('Healthcare', '#EF4444', 'heart-pulse'),
('Entertainment', '#A855F7', 'clapperboard'),
('Groceries', '#22C55E', 'shopping-cart'),
('Personal Care', '#14B8A6', 'sparkles'),
('Rent', '#64748B', 'house'),
('Other', '#6366F1', 'wallet')
ON CONFLICT (name) DO UPDATE 
SET color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ==========================================
-- VERIFY DEFAULT CATEGORIES
-- ==========================================
SELECT id, name, color, icon FROM default_categories ORDER BY id;

-- ==========================================
-- SEED COMPLETED
-- ==========================================
