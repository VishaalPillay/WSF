-- SENTRA Zone Seed Data
-- Run this in Supabase SQL Editor to populate all zones

-- Insert all Vellore crime zones
INSERT INTO zones (name, risk_level, polygon_geojson, description, active_hours) VALUES
-- HIGH RISK ZONES (RED)
('Sathuvachari (Burial Ground Area)', 'red', 
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1625,12.9465],[79.1675,12.9465],[79.1675,12.9515],[79.1625,12.9515],[79.1625,12.9465]]]}}',
 'Critical Red Zone along NH 48. High risk of share autos diverting to secluded areas after dark.', '18-06'),

('Green Circle Junction', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1569,12.9691],[79.1619,12.9691],[79.1619,12.9741],[79.1569,12.9741],[79.1569,12.9691]]]}}',
 'High transit friction zone. Funnel for drunkards moving between TASMAC outlets late at night.', '21-05'),

('Katpadi Railway Station', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1344,12.9766],[79.1404,12.9766],[79.1404,12.9826],[79.1344,12.9826],[79.1344,12.9766]]]}}',
 'Epicenter of transit crime. Risk of assault on moving trains near station approaches.', NULL),

('VIT Road (UGD Works)', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1475,12.9725],[79.1525,12.9725],[79.1525,12.9775],[79.1475,12.9775],[79.1475,12.9725]]]}}',
 'Construction-induced traffic slowdowns create a natural trap for women on two-wheelers.', NULL),

('Chittoor Bus Stand (Katpadi)', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1320,12.9730],[79.1380,12.9730],[79.1380,12.9790],[79.1320,12.9790],[79.1320,12.9730]]]}}',
 'Hotspot for juvenile crime rings targeting two-wheelers. General atmosphere of lawlessness.', NULL),

('Kagithapattarai (Palar River Bank)', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1415,12.9515],[79.1485,12.9515],[79.1485,12.9585],[79.1415,12.9585],[79.1415,12.9515]]]}}',
 'Extreme density of liquor outlets. Streets colonized by intoxicated men after 7 PM.', '19-05'),

('Vellore Fort Park (Moat Area)', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1290,12.9169],[79.1360,12.9169],[79.1360,12.9239],[79.1290,12.9239],[79.1290,12.9169]]]}}',
 'Predatory zone after dark. Secluded corners near the moat obscure visibility.', '18-06'),

('Vellore New Bus Stand', 'red',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1415,12.9315],[79.1485,12.9315],[79.1485,12.9385],[79.1415,12.9385],[79.1415,12.9315]]]}}',
 'Dark corners and lack of police patrolling inside the terminus. High density of transient offenders.', NULL),

-- MODERATE RISK ZONES (YELLOW)
('Viruthampet (Student Housing)', 'yellow',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1370,12.9570],[79.1430,12.9570],[79.1430,12.9630],[79.1370,12.9630],[79.1370,12.9570]]]}}',
 'Narrow residential lanes. High density of students attracts stalkers.', NULL),

('Gandhi Nagar (Residential)', 'yellow',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1315,12.9465],[79.1385,12.9465],[79.1385,12.9535],[79.1315,12.9535],[79.1315,12.9465]]]}}',
 'Wide, tree-lined streets are desolate in afternoons. Ideal hunting ground for snatchers.', '13-17'),

('Bagayam (Southern Fringe)', 'yellow',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.1165,12.8865],[79.1235,12.8865],[79.1235,12.8935],[79.1165,12.8935],[79.1165,12.8865]]]}}',
 'Stronghold of gangs. Inter-gang violence creates a volatile environment.', NULL),

('Ariyur', 'yellow',
 '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[79.0965,12.8765],[79.1035,12.8765],[79.1035,12.8835],[79.0965,12.8835],[79.0965,12.8765]]]}}',
 'Semi-rural settlement. High incidence of domestic violence.', NULL);

-- Verify insert
SELECT COUNT(*) as total_zones, 
       COUNT(CASE WHEN risk_level = 'red' THEN 1 END) as red_zones,
       COUNT(CASE WHEN risk_level = 'yellow' THEN 1 END) as yellow_zones
FROM zones;
