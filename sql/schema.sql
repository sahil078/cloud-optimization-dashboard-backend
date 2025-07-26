-- schema.sql
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('instance', 'storage')),
  provider TEXT,
  specs JSONB,
  cpu_utilization NUMERIC,
  memory_utilization NUMERIC,
  storage_used NUMERIC,
  monthly_cost NUMERIC,
  is_implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  recommendation_type TEXT CHECK (recommendation_type IN ('scale_up', 'scale_down', 'terminate')),
  description TEXT,
  impact JSONB,
  status TEXT CHECK (status IN ('pending', 'implemented', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);