-- Seed default categories for testing
INSERT INTO categories (userId, name, icon, type, color, isDefault, isActive) VALUES
(2, 'Food & Drink', 'fa-utensils', 'expense', '#FF6B6B', 1, 1),
(2, 'Transportation', 'fa-car', 'expense', '#4ECDC4', 1, 1),
(2, 'Entertainment', 'fa-gamepad', 'expense', '#95E1D3', 1, 1),
(2, 'Shopping', 'fa-shopping-bag', 'expense', '#F38181', 1, 1),
(2, 'Health', 'fa-heartbeat', 'expense', '#AA96DA', 1, 1),
(2, 'Rent', 'fa-home', 'expense', '#FCBAD3', 1, 1),
(2, 'Salary', 'fa-money-bill', 'income', '#A8E6CF', 1, 1),
(2, 'Bonus', 'fa-gift', 'income', '#FFD3B6', 1, 1);
