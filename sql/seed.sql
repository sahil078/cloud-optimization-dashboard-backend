INSERT INTO resources (name, type, provider, specs, cpu_utilization, memory_utilization, storage_used, monthly_cost)
VALUES 
  ('web-server-1', 'instance', 'AWS', '{"instanceType":"t3.xlarge"}', 15, 25, NULL, 150),
  ('api-server-2', 'instance', 'AWS', '{"instanceType":"m5.large"}', 12, 30, NULL, 130),
  ('cache-server-3', 'instance', 'GCP', '{"instanceType":"n1-standard-4"}', 10, 20, NULL, 140),

  ('db-server-1', 'instance', 'Azure', '{"instanceType":"D2s_v3"}', 65, 70, NULL, 100),
  ('auth-server-1', 'instance', 'Azure', '{"instanceType":"B2s"}', 60, 60, NULL, 90),

  ('storage-1', 'storage', 'AWS', '{"size":"1TB"}', NULL, NULL, 700, 300),
  ('storage-2', 'storage', 'GCP', '{"size":"750GB"}', NULL, NULL, 650, 280),

  ('backup-storage', 'storage', 'Azure', '{"size":"200GB"}', NULL, NULL, 180, 100);
INSERT INTO recommendations (resource_id, recommendation_type, description, impact)
VALUES
  (1, 'scale_down', 'Consider scaling down the web server to reduce costs.', '{"costReduction": 50, "performanceImpact": "minimal"}'),
  (2, 'scale_up', 'API server can handle more load, consider scaling up.', '{"costIncrease": 20, "performanceImpact": "improved"}'),
  (3, 'terminate', 'Cache server is underutilized, consider terminating.', '{"costSavings": 100, "performanceImpact             ": "none"}'),
  (4, 'scale_down', 'DB server is over-provisioned, consider scaling down.', '{"costReduction": 70, "performanceImpact": "minimal"}'),
  (5, 'scale_up', 'Auth server can handle more load, consider scaling up.', '{"costIncrease": 30, "performanceImpact": "improved"}'),
  (6, 'scale_down', 'Storage-1 is underutilized, consider scaling down.', '{"costReduction": 50, "performanceImpact": "none"}'),
  (7, 'terminate', 'Storage-2 is redundant, consider terminating.', '{"costSavings": 80, "performanceImpact": "none"}'),
  (8, 'scale_up', 'Backup storage can handle more data, consider scaling up.', '{"costIncrease": 40, "performanceImpact": "improved"}');
-- Ensure the recommendations table is created after the resources table