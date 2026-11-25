import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Console | VELOCITY VERSE",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-ink">{children}</div>;
}
