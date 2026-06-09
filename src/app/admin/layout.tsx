import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "rzstudio // admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col">
      {children}
    </div>
  );
}
