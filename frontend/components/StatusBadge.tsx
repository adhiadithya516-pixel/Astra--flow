interface Props {
  status: "live" | "active" | "pending" | "offline" | "stopped" | "delivered" | string;
  label?: string;
  pulse?: boolean;
}

const colors: Record<string, { bg: string; text: string; border: string }> = {
  live: { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
  active: { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
  offline: { bg: "rgba(107,114,128,0.1)", text: "#6B7280", border: "rgba(107,114,128,0.3)" },
  stopped: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
  delivered: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
};

export default function StatusBadge({ status, label, pulse }: Props) {
  const c = colors[status] || colors.offline;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.06em",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontFamily: "var(--font-data)",
    }}>
      {pulse && <span className={`live-pulse ${status === "live" || status === "active" ? "green" : ""}`} style={{ width: 5, height: 5 }} />}
      {label || status}
    </span>
  );
}
