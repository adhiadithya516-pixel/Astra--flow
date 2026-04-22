import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/gps/history
 * Returns paginated location history for a specific driver.
 * Query Params: driver_id, from (ISO), to (ISO)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driver_id = searchParams.get("driver_id");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!driver_id) {
      return NextResponse.json({ error: "Missing driver_id" }, { status: 400 });
    }

    let query = supabase
      .from("driver_locations")
      .select("*")
      .eq("driver_id", driver_id)
      .order("timestamp", { ascending: true })
      .limit(1000); // Pagination limit

    if (fromDate) query = query.gte("timestamp", fromDate);
    if (toDate) query = query.lte("timestamp", toDate);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, ok: true });
  } catch (error: any) {
    console.error("[GPS History Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
