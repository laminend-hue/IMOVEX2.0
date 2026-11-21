-- ============================================================================
-- DONNÉES DE SEEDING INITIALES — IMOVIEX DAKAR
-- ============================================================================

-- 1. QUARTIERS DE DAKAR ET RÉGION
INSERT INTO public.neighborhoods (name, slug, city, department, is_popular, display_order) VALUES
('Almadies', 'almadies', 'Dakar', 'Dakar', true, 1),
('Ngor', 'ngor', 'Dakar', 'Dakar', true, 2),
('Ouakam', 'ouakam', 'Dakar', 'Dakar', true, 3),
('Mermoz', 'mermoz', 'Dakar', 'Dakar', true, 4),
('Sacré-Cœur (1, 2, 3)', 'sacre-coeur', 'Dakar', 'Dakar', true, 5),
('Fann Résidence / Point E', 'fann-point-e', 'Dakar', 'Dakar', true, 6),
('Plateau (Centre-ville)', 'plateau', 'Dakar', 'Dakar', true, 7),
('Yoff (Tonghor, Virage, Apecsy)', 'yoff', 'Dakar', 'Dakar', true, 8),
('Mamelles', 'mamelles', 'Dakar', 'Dakar', true, 9),
('Grand-Dakar / Sicap', 'grand-dakar', 'Dakar', 'Dakar', false, 10),
('Hann Maristes', 'hann-maristes', 'Dakar', 'Dakar', true, 11),
('Liberté (1 à 6)', 'liberte', 'Dakar', 'Dakar', false, 12),
('Parcelles Assainies', 'parcelles-assainies', 'Dakar', 'Dakar', false, 13),
('Guédiawaye', 'guediawaye', 'Dakar', 'Pikine-Guédiawaye', false, 14),
('Rufisque', 'rufisque', 'Dakar', 'Rufisque', false, 15),
('Diamniadio', 'diamniadio', 'Dakar', 'Rufisque', false, 16)
ON CONFLICT (slug) DO NOTHING;
