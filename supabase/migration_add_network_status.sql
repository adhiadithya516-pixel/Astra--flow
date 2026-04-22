-- ============================================
-- Migration: Add network_status to location_pings
-- Run this on existing databases to add the column
-- ============================================

ALTER TABLE location_pings
ADD COLUMN IF NOT EXISTS network_status TEXT DEFAULT 'online';

COMMENT ON COLUMN location_pings.network_status IS
  'Tracks driver network state when ping was recorded: online = sent in real-time, offline = buffered locally and sent later';
