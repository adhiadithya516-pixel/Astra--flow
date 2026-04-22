import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "Astra Flow — Supply Chain Resilience Platform",
  description:
    "Real-time logistics tracking, AI disruption detection, and proactive rerouting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
