import { Metadata } from "next";
import { PortfolioContent } from "@/components/pages/PortfolioContent";

export const metadata: Metadata = {
  title: "portfolio // rzstudio",
  description: "galería de soluciones tecnológicas con impacto medible en roi y eficiencia.",
};

export default function PortfolioPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white">
      <PortfolioContent />
    </main>
  );
}
