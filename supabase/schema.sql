-- ============================================
-- ASTRA FLOW — Supabase PostgreSQL Schema
-- ============================================

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  driver_phone TEXT NOT NULL,
  driver_name TEXT,
  origin TEXT NOT NULL,
  origin_lat FLOAT NOT NULL,
  origin_lng FLOAT NOT NULL,
  destination TEXT NOT NULL,
  dest_lat FLOAT NOT NULL,
  dest_lng FLOAT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | active | offline | delivered | stopped
  total_distance_km FLOAT,
  started_at TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Route Segments (every 30km)
CREATE TABLE route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  segment_index INT NOT NULL,
  start_lat FLOAT,
  start_lng FLOAT,
  end_lat FLOAT,
  end_lng FLOAT,
  distance_km FLOAT DEFAULT 30,
  avg_speed_kmh FLOAT,
  entered_at TIMESTAMPTZ,
  exited_at TIMESTAMPTZ
);

-- Location Pings
CREATE TABLE location_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  speed_kmh FLOAT,
  heading FLOAT,
  is_predicted BOOLEAN DEFAULT false,
  network_status TEXT DEFAULT 'online',  -- online | offline (tracks driver connectivity)
  segment_index INT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Driver Status Log
CREATE TABLE driver_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,  -- online | offline | stopped | alert_sent | customer_notified
  lat FLOAT,
  lng FLOAT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- offline | stopped_45min | stopped_2hr | weather | traffic | delay_risk | offline_resolved
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info',  -- info | warning | critical
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tracking Sessions (privacy start/stop)
CREATE TABLE tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  driver_phone TEXT NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT now(),
  stopped_at TIMESTAMPTZ
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_shipments_tracking_id ON shipments(tracking_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_location_pings_shipment_id ON location_pings(shipment_id);
CREATE INDEX idx_location_pings_recorded_at ON location_pings(recorded_at);
CREATE INDEX idx_route_segments_shipment_id ON route_segments(shipment_id);
CREATE INDEX idx_alerts_shipment_id ON alerts(shipment_id);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_tracking_sessions_share_token ON tracking_sessions(share_token);
CREATE INDEX idx_tracking_sessions_active ON tracking_sessions(active);
CREATE INDEX idx_driver_status_log_shipment_id ON driver_status_log(shipment_id);

-- ============================================
-- Enable Supabase Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE location_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_status_log;

-- ============================================
-- Row Level Security (permissive for service role)
-- ============================================
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (backends use service key)
CREATE POLICY "Service role full access" ON shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON route_segments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON location_pings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON driver_status_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tracking_sessions FOR ALL USING (true) WITH CHECK (true);

-- Allow anon key to read shipments and tracking sessions (for driver page)
CREATE POLICY "Anon read shipments" ON shipments FOR SELECT USING (true);
CREATE POLICY "Anon read tracking sessions" ON tracking_sessions FOR SELECT USING (true);
CREATE POLICY "Anon read location pings" ON location_pings FOR SELECT USING (true);
CREATE POLICY "Anon read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Anon read route segments" ON route_segments FOR SELECT USING (true);
CREATE POLICY "Anon read driver status" ON driver_status_log FOR SELECT USING (true);
