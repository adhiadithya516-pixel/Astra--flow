"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiPost, apiGet } from "@/lib/api";

interface GeoResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface CreateResult {
  tracking_id: string;
  share_token: string;
  segment_count: number;
  total_distance_km: number;
  estimated_arrival: string;
}

export default function NewShipmentPage() {
  const router = useRouter();
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originResults, setOriginResults] = useState<GeoResult[]>([]);
  const [destResults, setDestResults] = useState<GeoResult[]>([]);
  const [showOriginAC, setShowOriginAC] = useState(false);
  const [showDestAC, setShowDestAC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const originTimer = useRef<NodeJS.Timeout | null>(null);
  const destTimer = useRef<NodeJS.Timeout | null>(null);

    // Auth bypassed


  const fetchAutocomplete = useCallback(async (query: string, setter: (r: GeoResult[]) => void) => {
    if (query.length < 3) {
      setter([]);
      return;
    }
    try {
      const data = await apiGet<{ results: GeoResult[] }>(
        `/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=5`
      );
      setter(data.results);
    } catch {
      setter([]);
    }
  }, []);

  function handleOriginChange(value: string) {
    setOrigin(value);
    setShowOriginAC(true);
    if (originTimer.current) clearTimeout(originTimer.current);
    originTimer.current = setTimeout(() => fetchAutocomplete(value, setOriginResults), 500);
  }

  function handleDestChange(value: string) {
    setDestination(value);
    setShowDestAC(true);
    if (destTimer.current) clearTimeout(destTimer.current);
    destTimer.current = setTimeout(() => fetchAutocomplete(value, setDestResults), 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !driverPhone) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<CreateResult>("/shipment/create", {
        driver_phone: `+91${driverPhone.trim()}`,
        driver_name: driverName.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
      });
      setResult(data);
      
      // Autonomously pop open WhatsApp immediately after creation
      const link = `${window.location.origin}/driver/${data.share_token}`;
      const msg = `🚚 Delivery Assignment Update\n\nHello Driver,\n\nYou have been assigned a new delivery task. Please check the shipment details, pickup location, route, and delivery instructions using the secure link below:\n\n${link}\n\nPlease review the task and confirm once you start the trip.\n\nSent by: Dispatch Team, Astra Flow Logistics\nFor support, contact the operations desk.\nThank you and drive safely.`;
      window.open(`https://wa.me/91${driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      
    } catch (err: unknown) {
      console.error('Full error:', err);
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(`API POST failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function getSmsBody() {
    if (!result) return "";
    const link = `${window.location.origin}/driver/${result.share_token}`;
    return `🚚 Delivery Assignment Update\n\nHello Driver,\n\nYou have been assigned a new delivery task. Please check the shipment details, pickup location, route, and delivery instructions using the secure link below:\n\n${link}\n\nPlease review the task and confirm once you start the trip.\n\nSent by: Dispatch Team, Astra Flow Logistics\nFor support, contact the operations desk.\nThank you and drive safely.`;
  }

  function copyLink() {
    if (!result) return;
    const textToCopy = getSmsBody();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(textArea);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (result) {
    const driverLink = `${typeof window !== "undefined" ? window.location.origin : ""}/driver/${result.share_token}`;
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Shipment Created</h1>
          <button className="btn btn-sm" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
        <div className="result-card">
          <h2>✓ Shipment Ready</h2>
          <div className="result-row">
            <span className="result-label">Tracking ID</span>
            <span className="result-value">{result.tracking_id}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Total Distance</span>
            <span className="result-value">{result.total_distance_km} km</span>
          </div>
          <div className="result-row">
            <span className="result-label">Segments</span>
            <span className="result-value">{result.segment_count}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Estimated Arrival</span>
            <span className="result-value">
              {new Date(result.estimated_arrival).toLocaleString("en-IN")}
            </span>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label className="form-label">Driver Tracking Link</label>
            <div className="copy-link-group">
              <input
                className="form-input"
                value={driverLink}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button className="btn btn-primary" onClick={copyLink} style={{ whiteSpace: "nowrap" }}>
                {copied ? "Copied!" : "Copy Message"}
              </button>
              <a 
                href={`sms:${driverPhone}?body=${encodeURIComponent(getSmsBody())}`}
                className="btn" 
                style={{ background: "var(--border)", color: "#fff", textDecoration: "none", whiteSpace: "nowrap", padding: "0 16px", display: "flex", alignItems: "center" }}
              >
                Send SMS
              </a>
              <a 
                href={`https://wa.me/${driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(getSmsBody())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn" 
                style={{ background: "#25D366", color: "#fff", textDecoration: "none", whiteSpace: "nowrap", padding: "0 16px", display: "flex", alignItems: "center", marginLeft: "8px" }}
              >
                Send via WhatsApp
              </a>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", marginBottom: "16px" }}>
              Send this link to the driver. They open it on their phone to start tracking.
            </p>
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
              <button className="btn btn-primary" style={{ padding: "8px 24px", minWidth: "200px" }} onClick={() => router.push(`/track/${result.tracking_id}`)}>
                View on Map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Shipment</h1>
        <button className="btn btn-sm" onClick={() => router.push("/dashboard")}>
          ← Back
        </button>
      </div>

      <div className="card" style={{ maxWidth: "480px" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="driver-name">Driver Name</label>
            <input
              id="driver-name"
              className="form-input"
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="driver-phone">Driver Phone Number</label>
            <div className="phone-input-group">
              <span className="phone-prefix">+91</span>
              <input
                id="driver-phone"
                className="form-input"
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                required
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label" htmlFor="origin">Origin</label>
            <input
              id="origin"
              className="form-input"
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowOriginAC(false), 200)}
              onFocus={() => originResults.length > 0 && setShowOriginAC(true)}
              placeholder="e.g. Mumbai, Maharashtra"
              required
            />
            {showOriginAC && originResults.length > 0 && (
              <div className="autocomplete-list">
                {originResults.map((r, i) => (
                  <div
                    key={i}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      setOrigin(r.display_name);
                      setShowOriginAC(false);
                      setOriginResults([]);
                    }}
                  >
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label" htmlFor="destination">Destination</label>
            <input
              id="destination"
              className="form-input"
              type="text"
              value={destination}
              onChange={(e) => handleDestChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowDestAC(false), 200)}
              onFocus={() => destResults.length > 0 && setShowDestAC(true)}
              placeholder="e.g. Delhi, India"
              required
            />
            {showDestAC && destResults.length > 0 && (
              <div className="autocomplete-list">
                {destResults.map((r, i) => (
                  <div
                    key={i}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      setDestination(r.display_name);
                      setShowDestAC(false);
                      setDestResults([]);
                    }}
                  >
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "var(--red)", marginBottom: "12px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Creating shipment…" : "Create Shipment"}
          </button>
        </form>
      </div>
    </div>
  );
}
