import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/gps/ping
 * Handles a single real-time GPS ping from the driver's device.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driver_id, session_id, lat, lng, accuracy, speed, heading, timestamp } = body;

    if (!driver_id || !session_id || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert the location ping to Supabase
    const { error } = await supabase
      .from("driver_locations")
      .insert({
        driver_id,
        session_id,
        lat,
        lng,
        accuracy,
        speed: speed || 0,
        heading: heading || 0,
        is_predicted: false,
        timestamp: timestamp || new Date().toISOString(),
      });

    if (error) throw error;

    // In a real environment, we'd emit via a Redis adapter or call the WS server API.
    // For this architecture, the WS server might just listen to Supabase realtime or
    // we assume the client also emits via Socket.IO directly.
    
    return NextResponse.json({ ok: true, server_time: new Date().toISOString() });
  } catch (error: any) {
    console.error("[GPS Ping Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
