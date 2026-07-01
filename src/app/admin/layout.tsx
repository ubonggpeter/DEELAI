import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DEELAI Admin",
  description: "DEELAI Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#060A12", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
