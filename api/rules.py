"""
Rule Engine for Astra Flow.
Background task that checks all active shipments every 60 seconds.
Implements 5 rules: offline detection, stopped 45min, stopped 2hr, delay risk, back online.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from predictor import predict_location, calculate_avg_speed, haversine_distance
from weather import get_weather, check_traffic

logger = logging.getLogger("astra.rules")


class RuleEngine:
    def __init__(self, supabase_client):
        self.sb = supabase_client
        self._running = False
        self._prediction_tasks: dict[str, asyncio.Task] = {}  # shipment_id -> task

    async def start(self):
        """Start the rule engine background loop."""
        self._running = True
        logger.info("Rule engine started")
        while self._running:
            try:
                await self._check_all_shipments()
            except Exception as e:
                logger.error(f"Rule engine error: {e}")
            await asyncio.sleep(60)

    def stop(self):
        """Stop the rule engine."""
        self._running = False
        for task in self._prediction_tasks.values():
            task.cancel()
        self._prediction_tasks.clear()
        logger.info("Rule engine stopped")

    async def _check_all_shipments(self):
        """Check all active/offline shipments against rules."""
        result = self.sb.table("shipments").select("*").in_(
            "status", ["active", "offline"]
        ).execute()
        shipments = result.data or []

        for shipment in shipments:
            try:
                await self._check_shipment(shipment)
            except Exception as e:
                logger.error(f"Error checking shipment {shipment['tracking_id']}: {e}")

    async def _check_shipment(self, shipment: dict):
        """Run all rules against a single shipment."""
        shipment_id = shipment["id"]
        tracking_id = shipment["tracking_id"]
        current_status = shipment["status"]

        # Get last real (non-predicted) ping
        ping_result = self.sb.table("location_pings").select("*").eq(
            "shipment_id", shipment_id
        ).eq("is_predicted", False).order(
            "recorded_at", desc=True
        ).limit(1).execute()

        last_ping = ping_result.data[0] if ping_result.data else None
        if not last_ping:
            return

        now = datetime.now(timezone.utc)
        last_ping_time = datetime.fromisoformat(last_ping["recorded_at"].replace("Z", "+00:00"))
        seconds_since_ping = (now - last_ping_time).total_seconds()

        # Rule 1: Offline Detection
        if seconds_since_ping > 120 and current_status != "offline":
            await self._rule_offline_detection(shipment, last_ping, last_ping_time)

        # Rule 5: Back Online (checked via new ping arrival, handled in ws-server)
        # This is also checked here as a fallback
        if seconds_since_ping < 60 and current_status == "offline":
            await self._rule_back_online(shipment, last_ping)

        # Rule 2: Stopped 45 minutes
        if current_status in ("active", "offline"):
            await self._rule_stopped_45min(shipment, shipment_id, last_ping, now)

        # Rule 3: Stopped 2+ hours
        if current_status in ("active", "offline"):
            await self._rule_stopped_2hr(shipment, shipment_id, last_ping, now)

        # Rule 4: Delay Risk
        if current_status in ("active", "offline"):
            await self._rule_delay_risk(shipment, shipment_id)

        # Rule 6: Continuous Climate/Weather check
        if current_status in ("active", "offline"):
            await self._rule_continuous_weather(shipment, shipment_id, last_ping, now)

    async def _rule_continuous_weather(self, shipment: dict, shipment_id: str, last_ping: dict, now: datetime):
        """Rule 6: Check climate changes intermittently every 15 minutes."""
        # Check if weather checked in last 15 mins
        existing = self.sb.table("alerts").select("id").eq(
            "shipment_id", shipment_id
        ).eq("type", "weather_update").gte(
            "created_at", (now - timedelta(minutes=15)).isoformat()
        ).execute()
        if existing.data:
            return

        lat, lng = last_ping["lat"], last_ping["lng"]
        try:
            weather = await get_weather(lat, lng)
            # Create an info/warning alert with the current weather condition
            severity = "warning" if weather.get("is_severe") else "info"
            message = f"Weather Update: {weather['description']} ({weather.get('wind_kmh', 0)} km/h wind)"
            
            # Record the climate update
            self.sb.table("alerts").insert({
                "shipment_id": shipment_id,
                "type": "weather_update",
                "severity": severity,
                "message": message,
            }).execute()
        except Exception as e:
            logger.warning(f"Continuous weather check failed: {e}")

    async def _rule_offline_detection(self, shipment: dict, last_ping: dict, last_ping_time: datetime):
        """Rule 1: Detect driver going offline (>2min since last ping)."""
        shipment_id = shipment["id"]
        tracking_id = shipment["tracking_id"]

        logger.info(f"[Rule 1] Driver offline: {tracking_id}")

        # Update shipment status
        self.sb.table("shipments").update({"status": "offline"}).eq("id", shipment_id).execute()

        # Log status change
        self.sb.table("driver_status_log").insert({
            "shipment_id": shipment_id,
            "status": "offline",
            "lat": last_ping["lat"],
            "lng": last_ping["lng"],
            "note": f"Driver went offline at {last_ping_time.isoformat()}",
        }).execute()

        # Create alert
        self.sb.table("alerts").insert({
            "shipment_id": shipment_id,
            "type": "offline",
            "severity": "warning",
            "message": f"Driver went offline at ({last_ping['lat']:.4f}, {last_ping['lng']:.4f})",
        }).execute()

        # Start prediction loop
        if shipment_id not in self._prediction_tasks:
            task = asyncio.create_task(self._prediction_loop(shipment_id, last_ping))
            self._prediction_tasks[shipment_id] = task

    async def _prediction_loop(self, shipment_id: str, last_real_ping: dict):
        """Generate predicted positions every 30 seconds while driver is offline."""
        logger.info(f"Starting prediction loop for {shipment_id}")

        try:
            while True:
                await asyncio.sleep(30)

                # Check if still offline
                result = self.sb.table("shipments").select("status").eq("id", shipment_id).execute()
                if not result.data or result.data[0]["status"] != "offline":
                    break

                # Get recent speeds for averaging
                speed_result = self.sb.table("location_pings").select("speed_kmh").eq(
                    "shipment_id", shipment_id
                ).eq("is_predicted", False).order("recorded_at", desc=True).limit(5).execute()

                speeds = [p["speed_kmh"] for p in (speed_result.data or []) if p.get("speed_kmh")]
                avg_speed = calculate_avg_speed(speeds) if speeds else 40.0

                # Calculate time since last real ping
                now = datetime.now(timezone.utc)
                last_time = datetime.fromisoformat(
                    last_real_ping["recorded_at"].replace("Z", "+00:00")
                )
                secs_offline = (now - last_time).total_seconds()

                heading = last_real_ping.get("heading", 0) or 0

                prediction = predict_location(
                    last_lat=last_real_ping["lat"],
                    last_lng=last_real_ping["lng"],
                    last_heading=heading,
                    avg_speed_kmh=avg_speed,
                    seconds_offline=secs_offline,
                )

                # Insert predicted ping
                self.sb.table("location_pings").insert({
                    "shipment_id": shipment_id,
                    "lat": prediction["predicted_lat"],
                    "lng": prediction["predicted_lng"],
                    "speed_kmh": avg_speed,
                    "heading": heading,
                    "is_predicted": True,
                    "recorded_at": now.isoformat(),
                }).execute()

                logger.info(
                    f"Predicted position for {shipment_id}: "
                    f"({prediction['predicted_lat']}, {prediction['predicted_lng']}) "
                    f"confidence: {prediction['confidence_pct']}%"
                )

        except asyncio.CancelledError:
            logger.info(f"Prediction loop cancelled for {shipment_id}")
        except Exception as e:
            logger.error(f"Prediction loop error for {shipment_id}: {e}")
        finally:
            self._prediction_tasks.pop(shipment_id, None)

    async def _rule_back_online(self, shipment: dict, last_ping: dict):
        """Rule 5: Driver comes back online after being offline."""
        shipment_id = shipment["id"]
        tracking_id = shipment["tracking_id"]

        logger.info(f"[Rule 5] Driver back online: {tracking_id}")

        # Update status
        self.sb.table("shipments").update({"status": "active"}).eq("id", shipment_id).execute()

        # Log status change
        self.sb.table("driver_status_log").insert({
            "shipment_id": shipment_id,
            "status": "online",
            "lat": last_ping["lat"],
            "lng": last_ping["lng"],
            "note": "Driver back online",
        }).execute()

        # Create info alert
        self.sb.table("alerts").insert({
            "shipment_id": shipment_id,
            "type": "offline_resolved",
            "severity": "info",
            "message": f"Driver back online at ({last_ping['lat']:.4f}, {last_ping['lng']:.4f})",
        }).execute()

        # Stop prediction loop — do NOT delete predicted pings
        if shipment_id in self._prediction_tasks:
            self._prediction_tasks[shipment_id].cancel()
            self._prediction_tasks.pop(shipment_id, None)

    async def _rule_stopped_45min(self, shipment: dict, shipment_id: str, last_ping: dict, now: datetime):
        """Rule 2: Driver stopped for 45 minutes."""
        cutoff = now - timedelta(minutes=45)

        # Check if alert already exists in last hour
        existing = self.sb.table("alerts").select("id").eq(
            "shipment_id", shipment_id
        ).eq("type", "stopped_45min").gte(
            "created_at", (now - timedelta(hours=1)).isoformat()
        ).execute()
        if existing.data:
            return

        # Get all pings in last 45 minutes
        pings_result = self.sb.table("location_pings").select("lat,lng,speed_kmh").eq(
            "shipment_id", shipment_id
        ).eq("is_predicted", False).gte(
            "recorded_at", cutoff.isoformat()
        ).execute()

        pings = pings_result.data or []
        if len(pings) < 3:
            return

        # Check if all pings within 200m radius and low speed
        ref_lat, ref_lng = pings[0]["lat"], pings[0]["lng"]
        all_within_radius = all(
            haversine_distance(ref_lat, ref_lng, p["lat"], p["lng"]) < 0.2
            for p in pings
        )
        all_slow = all((p.get("speed_kmh") or 0) < 5 for p in pings)

        if not (all_within_radius and all_slow):
            return

        logger.info(f"[Rule 2] Driver stopped 45min: {shipment['tracking_id']}")

        # Check weather and traffic
        lat, lng = last_ping["lat"], last_ping["lng"]
        try:
            weather = await get_weather(lat, lng)
            if weather.get("is_severe"):
                self.sb.table("alerts").insert({
                    "shipment_id": shipment_id,
                    "type": "weather",
                    "severity": "warning",
                    "message": f"Possible weather delay: {weather['description']} at ({lat:.4f}, {lng:.4f})",
                }).execute()
                return
        except Exception as e:
            logger.warning(f"Weather check failed: {e}")

        try:
            traffic = await check_traffic(lat, lng)
            if traffic.get("has_incident"):
                self.sb.table("alerts").insert({
                    "shipment_id": shipment_id,
                    "type": "traffic",
                    "severity": "warning",
                    "message": f"Possible road incident: {traffic['description']}",
                }).execute()
                return
        except Exception as e:
            logger.warning(f"Traffic check failed: {e}")

        # No weather/traffic issue — general 45min stop alert
        self.sb.table("alerts").insert({
            "shipment_id": shipment_id,
            "type": "stopped_45min",
            "severity": "warning",
            "message": "Driver has not moved for 45 minutes. Sent notification to driver.",
        }).execute()

        self.sb.table("driver_status_log").insert({
            "shipment_id": shipment_id,
            "status": "alert_sent",
            "lat": lat,
            "lng": lng,
            "note": "45-minute stop alert triggered",
        }).execute()

    async def _rule_stopped_2hr(self, shipment: dict, shipment_id: str, last_ping: dict, now: datetime):
        """Rule 3: Driver stopped for 2+ hours (165 min total = 45 + 120)."""
        cutoff = now - timedelta(minutes=165)

        # Check if alert already exists in last 3 hours
        existing = self.sb.table("alerts").select("id").eq(
            "shipment_id", shipment_id
        ).eq("type", "stopped_2hr").gte(
            "created_at", (now - timedelta(hours=3)).isoformat()
        ).execute()
        if existing.data:
            return

        # Get all pings in last 165 minutes
        pings_result = self.sb.table("location_pings").select("lat,lng,speed_kmh").eq(
            "shipment_id", shipment_id
        ).eq("is_predicted", False).gte(
            "recorded_at", cutoff.isoformat()
        ).execute()

        pings = pings_result.data or []
        if len(pings) < 3:
            return

        ref_lat, ref_lng = pings[0]["lat"], pings[0]["lng"]
        all_within_radius = all(
            haversine_distance(ref_lat, ref_lng, p["lat"], p["lng"]) < 0.2
            for p in pings
        )
        all_slow = all((p.get("speed_kmh") or 0) < 5 for p in pings)

        if not (all_within_radius and all_slow):
            return

        logger.info(f"[Rule 3] Driver stopped 2hr: {shipment['tracking_id']}")

        self.sb.table("alerts").insert({
            "shipment_id": shipment_id,
            "type": "stopped_2hr",
            "severity": "critical",
            "message": "No response from driver for 2 hours. Customer has been notified.",
        }).execute()

        self.sb.table("driver_status_log").insert({
            "shipment_id": shipment_id,
            "status": "customer_notified",
            "lat": last_ping["lat"],
            "lng": last_ping["lng"],
            "note": "2-hour stop — customer notification triggered",
        }).execute()

    async def _rule_delay_risk(self, shipment: dict, shipment_id: str):
        """Rule 4: Delay risk prediction based on segment speeds."""
        if not shipment.get("estimated_arrival") or not shipment.get("total_distance_km"):
            return

        now = datetime.now(timezone.utc)

        # Check if alert already exists in last 2 hours
        existing = self.sb.table("alerts").select("id").eq(
            "shipment_id", shipment_id
        ).eq("type", "delay_risk").gte(
            "created_at", (now - timedelta(hours=2)).isoformat()
        ).execute()
        if existing.data:
            return

        # Get last 2 completed segments
        seg_result = self.sb.table("route_segments").select("avg_speed_kmh,distance_km").eq(
            "shipment_id", shipment_id
        ).not_.is_("avg_speed_kmh", "null").order(
            "segment_index", desc=True
        ).limit(2).execute()

        segments = seg_result.data or []
        if len(segments) < 2:
            return

        # Calculate average speed of last 2 segments
        avg_recent = sum(s["avg_speed_kmh"] for s in segments) / len(segments)

        # Expected average speed (total_distance / expected_duration)
        original_eta = datetime.fromisoformat(shipment["estimated_arrival"].replace("Z", "+00:00"))
        started = datetime.fromisoformat(shipment["started_at"].replace("Z", "+00:00")) if shipment.get("started_at") else shipment.get("created_at")
        if isinstance(started, str):
            started = datetime.fromisoformat(started.replace("Z", "+00:00"))

        expected_duration_hr = (original_eta - started).total_seconds() / 3600.0
        if expected_duration_hr <= 0:
            return

        expected_avg_speed = shipment["total_distance_km"] / expected_duration_hr

        # Check if recent speed is < 60% of expected
        if avg_recent >= expected_avg_speed * 0.6:
            return

        # Calculate new ETA
        # Get remaining distance
        completed_seg = self.sb.table("route_segments").select("distance_km").eq(
            "shipment_id", shipment_id
        ).not_.is_("avg_speed_kmh", "null").execute()
        completed_km = sum(s["distance_km"] for s in (completed_seg.data or []))
        remaining_km = shipment["total_distance_km"] - completed_km

        if remaining_km <= 0 or avg_recent <= 0:
            return

        new_hours_remaining = remaining_km / avg_recent
        new_eta = now + timedelta(hours=new_hours_remaining)

        delay_minutes = (new_eta - original_eta).total_seconds() / 60.0

        if delay_minutes > 90:
            delay_hours = round(delay_minutes / 60.0, 1)
            logger.info(f"[Rule 4] Delay risk: {shipment['tracking_id']} — {delay_hours}h late")

            self.sb.table("alerts").insert({
                "shipment_id": shipment_id,
                "type": "delay_risk",
                "severity": "warning",
                "message": f"Shipment may arrive {delay_hours} hours late based on current speed ({avg_recent:.0f} km/h avg)",
            }).execute()
