-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create driver_locations table
CREATE TABLE IF NOT EXISTS public.driver_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL,
    session_id UUID NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    is_predicted BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add spatial column for PostGIS queries (Point, WGS 84)
SELECT AddGeometryColumn('public', 'driver_locations', 'geom', 4326, 'POINT', 2);

-- Function to automatically update the geom column when lat/lng are inserted/updated
CREATE OR REPLACE FUNCTION update_location_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_location_geom
BEFORE INSERT OR UPDATE OF lat, lng ON public.driver_locations
FOR EACH ROW EXECUTE FUNCTION update_location_geom();

-- Create spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_driver_locations_geom 
ON public.driver_locations USING GIST (geom);

-- Create index on driver_id and timestamp for fast history retrieval
CREATE INDEX IF NOT EXISTS idx_driver_locations_history 
ON public.driver_locations (driver_id, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Drivers can insert their own locations
CREATE POLICY "Drivers can insert own locations" 
ON public.driver_locations FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = driver_id);

-- RLS Policy: Drivers can read their own locations
CREATE POLICY "Drivers can view own locations" 
ON public.driver_locations FOR SELECT 
TO authenticated
USING (auth.uid() = driver_id);

-- RLS Policy: Admins/Service Roles can read all locations
CREATE POLICY "Admins can view all locations" 
ON public.driver_locations FOR SELECT 
TO service_role
USING (true);
