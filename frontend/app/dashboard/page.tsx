"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";

interface DashboardStats {
  active_shipments: number;
  offline_drivers: number;
  alerts_today: number;
  on_time_rate: number;
}

interface Shipment {
  id: string;
  tracking_id: string;
  driver_name: string;
  driver_phone: string;
  origin: string;
  destination: string;
  status: string;
  estimated_arrival: string;
  delay_risk: string;
  created_at: string;
}

interface Alert {
  id: string;
  shipment_id: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
  created_at: string;
  shipments?: { tracking_id: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    active_shipments: 0,
    offline_drivers: 0,
    alerts_today: 0,
    on_time_rate: 100,
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertFilter, setAlertFilter] = useState("all");
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsData, shipmentsData, alertsData] = await Promise.all([
        apiGet<DashboardStats>("/dashboard/stats"),
        apiGet<{ shipments: Shipment[] }>("/dashboard/shipments"),
        apiGet<{ alerts: Alert[] }>("/dashboard/alerts"),
      ]);
      setStats(statsData);
      setShipments(shipmentsData.shipments);
      setAlerts(alertsData.alerts);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth bypassed for local testing
    loadData();

    // Clock tick
    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    // Refresh data every 30s
    const dataInterval = setInterval(loadData, 30000);

    // Realtime alerts subscription
    const channel = supabase
      .channel("dashboard-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 50));
          loadData(); // Refresh stats too
        }
      )
      .subscribe();

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
      supabase.removeChannel(channel);
    };
  }, [router, loadData]);

  const filteredAlerts =
    alertFilter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === alertFilter);

  function formatETA(ts: string) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function truncate(str: string, n: number) {
    if (!str) return "";
    const parts = str.split(",");
    return parts[0].length > n ? parts[0].slice(0, n) + "…" : parts[0];
  }

  function timeAgo(ts: string) {
    if (!ts) return "";
    const diff = (now.getTime() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (loading) {
    return <div className="loading-state">Loading dashboard…</div>;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>Astra Flow — Control Tower</h1>
        <div className="header-right">
          <span>{now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          {" · "}
          <span>{now.toLocaleTimeString("en-IN")}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Active Shipments</div>
          <div className="stat-value">{stats.active_shipments}</div>
        </div>
        <div className={`stat-card ${stats.offline_drivers > 0 ? "stat-danger" : ""}`}>
          <div className="stat-label">Offline Drivers</div>
          <div className="stat-value">{stats.offline_drivers}</div>
        </div>
        <div className={`stat-card ${stats.alerts_today > 5 ? "stat-warning" : ""}`}>
          <div className="stat-label">Alerts Today</div>
          <div className="stat-value">{stats.alerts_today}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On-Time Rate</div>
          <div className="stat-value">{stats.on_time_rate}%</div>
        </div>
      </div>

      {/* Main + Sidebar */}
      <div className="dashboard-layout">
        <div className="dashboard-main">
          {/* Action bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Shipments</h2>
            <Link href="/shipment/new">
              <button className="btn btn-primary btn-sm">+ New Shipment</button>
            </Link>
          </div>

          {/* Shipments table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>ETA</th>
                  <th>Delay Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                      No shipments yet. Create your first shipment to get started.
                    </td>
                  </tr>
                )}
                {shipments.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.tracking_id}</td>
                    <td>
                      <div style={{ fontSize: "13px" }}>{s.driver_name || "—"}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-data)" }}>{s.driver_phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px" }}>{truncate(s.origin, 20)}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>→ {truncate(s.destination, 20)}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status}`}>
                        {s.status === 'active' ? 'STARTED / IN TRANSIT' : s.status}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: "12px" }}>
                      {formatETA(s.estimated_arrival)}
                    </td>
                    <td>
                      <span className={`risk-${s.delay_risk?.toLowerCase()}`} style={{ fontSize: "12px", fontWeight: 600 }}>
                        {s.delay_risk || "LOW"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => router.push(`/track/${s.tracking_id}`)}>View Map</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="dashboard-sidebar">
          <div className="dashboard-sidebar-header">Live Alerts</div>
          <div className="alert-filters">
            {["all", "critical", "warning"].map((f) => (
              <button
                key={f}
                className={`alert-filter-btn ${alertFilter === f ? "active" : ""}`}
                onClick={() => setAlertFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div>
            {filteredAlerts.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No alerts
              </div>
            )}
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                className={`alert-item ${!a.resolved ? "alert-unresolved" : ""}`}
              >
                <div className={`alert-dot ${a.severity}`} />
                <div className="alert-content">
                  <div className="alert-message">{a.message}</div>
                  <div className="alert-meta">
                    {a.shipments?.tracking_id || "—"} · {timeAgo(a.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
