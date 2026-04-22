import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/gps/bulk-sync
 * Handles an array of offline-buffered pings from IndexedDB.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pings } = body;

    if (!pings || !Array.isArray(pings) || pings.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Map payload to DB schema
    const records = pings.map((ping: any) => ({
      driver_id: ping.driver_id,
      session_id: ping.session_id,
      lat: ping.lat,
      lng: ping.lng,
      accuracy: ping.accuracy,
      speed: ping.speed || 0,
      heading: ping.heading || 0,
      is_predicted: false,
      timestamp: ping.timestamp,
    }));

    // Batch insert into Supabase
    const { error } = await supabase
      .from("driver_locations")
      .insert(records);

    if (error) throw error;

    return NextResponse.json({ ok: true, synced_count: records.length });
  } catch (error: any) {
    console.error("[GPS Bulk Sync Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
