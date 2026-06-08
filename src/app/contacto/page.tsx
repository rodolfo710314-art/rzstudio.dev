import { Metadata } from "next";
import { ContactContent } from "@/components/pages/ContactContent";

export const metadata: Metadata = {
  title: "contacto // rzstudio",
  description: "hablemos sobre cómo la inteligencia artificial puede potenciar tu negocio.",
};

export default function ContactoPage() {
  return (
    <main className="pt-32 pb-20 bg-transparent text-white">
      <section className="container mx-auto px-6">
        <ContactContent />
      </section>
    </main>
  );
}
