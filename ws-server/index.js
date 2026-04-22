/**
 * Astra Flow — WebSocket Relay Server
 * Node.js + Socket.IO
 *
 * Handles real-time driver location pings and broadcasts to dashboard subscribers.
 * Validates share tokens against Supabase tracking_sessions.
 */

require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

const PORT = process.env.PORT || 3001;

// Supabase client (service role for full DB access)
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "astra-flow-ws" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Restrict in production to Vercel domain
    methods: ["GET", "POST"],
  },
  pingInterval: 30000, // 30s heartbeat
  pingTimeout: 60000, // 60s timeout → mark as offline
});

// Track connected drivers: socket.id -> { tracking_id, shipment_id }
const connectedDrivers = new Map();

io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  /**
   * Driver sends GPS ping
   * Payload: { tracking_id, share_token, lat, lng, speed_kmh, heading }
   */
  socket.on("driver:ping", async (data) => {
    const { tracking_id, share_token, lat, lng, speed_kmh, heading, network_status, buffered_at } = data;

    if (!tracking_id || !share_token || lat == null || lng == null) {
      socket.emit("error", { message: "Missing required fields" });
      return;
    }

    try {
      // Validate share token
      const { data: sessions, error: sessionError } = await supabase
        .from("tracking_sessions")
        .select("*, shipments(id, status)")
        .eq("share_token", share_token)
        .limit(1);

      if (sessionError || !sessions || sessions.length === 0) {
        socket.emit("error", { message: "Invalid share token" });
        return;
      }

      const session = sessions[0];

      if (!session.active) {
        socket.emit("tracking:stopped", {
          message: "Tracking session has been stopped",
        });
        return;
      }

      const shipment_id = session.shipment_id;

      // Join the tracking room
      socket.join(tracking_id);
      connectedDrivers.set(socket.id, { tracking_id, shipment_id });

      // Insert location ping
      const pingRecord = {
        shipment_id,
        lat,
        lng,
        speed_kmh: speed_kmh || 0,
        heading: heading || 0,
        is_predicted: false,
        network_status: network_status || "online",
      };
      // If this was a buffered ping, use the original timestamp
      if (buffered_at) {
        pingRecord.recorded_at = buffered_at;
      }
      const { error: pingError } = await supabase
        .from("location_pings")
        .insert(pingRecord);

      if (pingError) {
        console.error(`[WS] Ping insert error:`, pingError);
      }

      // Update shipment status to active if it was pending or offline
      const currentStatus = session.shipments?.status;
      if (currentStatus === "pending" || currentStatus === "offline") {
        await supabase
          .from("shipments")
          .update({
            status: "active",
            started_at:
              currentStatus === "pending"
                ? new Date().toISOString()
                : undefined,
          })
          .eq("id", shipment_id);

        // If coming back from offline, log the event
        if (currentStatus === "offline") {
          await supabase.from("driver_status_log").insert({
            shipment_id,
            status: "online",
            lat,
            lng,
            note: "Driver reconnected via WebSocket",
          });

          await supabase.from("alerts").insert({
            shipment_id,
            type: "offline_resolved",
            severity: "info",
            message: `Driver back online at (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          });
        }
      }

      // Calculate which segment the driver is in and update avg speed
      await updateSegmentSpeed(shipment_id, lat, lng, speed_kmh);

      // Broadcast to dashboard subscribers
      io.to(tracking_id).emit("location:update", {
        tracking_id,
        shipment_id,
        lat,
        lng,
        speed_kmh: speed_kmh || 0,
        heading: heading || 0,
        is_predicted: false,
        network_status: network_status || "online",
        recorded_at: buffered_at || new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[WS] Error processing ping:`, err);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  // ==========================================
  // NEW GPS TRACKING EVENTS
  // ==========================================

  /**
   * "gps:ping" -> driver sends location every 10s
   */
  socket.on("gps:ping", async (data) => {
    const { driver_id, session_id, lat, lng, speed, heading, accuracy } = data;
    if (!driver_id || !session_id) return;

    socket.join(`dashboard_${session_id}`); // Ensure driver can broadcast to its session
    
    // Broadcast gps:update to dashboard room
    io.to(`dashboard_${session_id}`).emit("gps:update", {
      driver_id, session_id, lat, lng, speed, heading, accuracy,
      is_predicted: false,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * "gps:offline" -> driver sends buffered IndexedDB pings on reconnect
   */
  socket.on("gps:offline", async (data) => {
    const { pings } = data;
    if (!pings || !Array.isArray(pings)) return;
    
    console.log(`[WS] Received ${pings.length} offline pings for batch processing`);
    // Note: Actual batch-insert is handled by the Next.js API route /api/gps/bulk-sync
    // but the server can notify the dashboard that reconciliation occurred
    if (pings.length > 0 && pings[0].session_id) {
       io.to(`dashboard_${pings[0].session_id}`).emit("gps:reconciled", { count: pings.length });
    }
  });

  /**
   * "gps:predict" -> server emits Kalman-predicted position
   * Triggered when a ping hasn't been received recently
   */
  socket.on("gps:predict", (data) => {
    const { session_id, lat, lng, dt } = data;
    io.to(`dashboard_${session_id}`).emit("gps:update", {
      ...data,
      is_predicted: true,
      timestamp: new Date().toISOString(),
      note: "Estimated via Kalman Filter"
    });
  });

  // ==========================================

  /**
   * Dashboard subscribes to a tracking room
   * Payload: { tracking_id }
   */
  socket.on("dashboard:subscribe", (data) => {
    const { tracking_id } = data;
    if (!tracking_id) return;

    socket.join(tracking_id);
    console.log(
      `[WS] Dashboard subscribed to ${tracking_id} (socket: ${socket.id})`
    );
  });

  /**
   * Handle disconnect
   */
  socket.on("disconnect", async (reason) => {
    console.log(`[WS] Client disconnected: ${socket.id} (${reason})`);
    const driverInfo = connectedDrivers.get(socket.id);

    if (driverInfo) {
      connectedDrivers.delete(socket.id);

      // Check if any other sockets are still connected for this tracking_id
      const room = io.sockets.adapter.rooms.get(driverInfo.tracking_id);
      const hasOtherDrivers = room && room.size > 0;

      if (!hasOtherDrivers) {
        // No more connections for this tracking — will be detected as offline
        // by the rule engine after 2 minutes of no pings
        console.log(
          `[WS] No more connections for ${driverInfo.tracking_id}, rule engine will detect offline`
        );
      }
    }
  });
});

/**
 * Calculate which 30km segment the driver is in and update average speed.
 */
async function updateSegmentSpeed(shipment_id, lat, lng, speed_kmh) {
  if (!speed_kmh || speed_kmh <= 0) return;

  try {
    // Get all segments for this shipment
    const { data: segments } = await supabase
      .from("route_segments")
      .select("*")
      .eq("shipment_id", shipment_id)
      .order("segment_index");

    if (!segments || segments.length === 0) return;

    // Find closest segment
    let closestIdx = 0;
    let minDist = Infinity;

    for (const seg of segments) {
      const midLat = (seg.start_lat + seg.end_lat) / 2;
      const midLng = (seg.start_lng + seg.end_lng) / 2;
      const dist = haversineDistance(lat, lng, midLat, midLng);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = seg.segment_index;
      }
    }

    const currentSeg = segments.find((s) => s.segment_index === closestIdx);
    if (!currentSeg) return;

    // Update segment avg speed (running average)
    const now = new Date().toISOString();
    const newAvg = currentSeg.avg_speed_kmh
      ? (currentSeg.avg_speed_kmh + speed_kmh) / 2
      : speed_kmh;

    const updateData = {
      avg_speed_kmh: Math.round(newAvg * 10) / 10,
    };

    if (!currentSeg.entered_at) {
      updateData.entered_at = now;
    }

    await supabase
      .from("route_segments")
      .update(updateData)
      .eq("id", currentSeg.id);

    // Mark previous segments as exited if they don't have exit time
    if (closestIdx > 0) {
      for (const seg of segments) {
        if (seg.segment_index < closestIdx && !seg.exited_at) {
          await supabase
            .from("route_segments")
            .update({ exited_at: now })
            .eq("id", seg.id);
        }
      }
    }
  } catch (err) {
    console.error("[WS] Error updating segment speed:", err);
  }
}

/**
 * Haversine distance in km between two lat/lng points.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

httpServer.listen(PORT, () => {
  console.log(`[WS] Astra Flow WebSocket server running on port ${PORT}`);
});
