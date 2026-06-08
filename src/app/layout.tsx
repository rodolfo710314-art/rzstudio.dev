import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { HardwareProvider } from "@/context/HardwareContext";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SmartChatbot } from "@/components/ia/SmartChatbot";
import { NeuralNetwork } from "@/components/canvas/NeuralNetwork";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rzstudio // desarrollo web y apps con ia",
  description: "desarrollamos soluciones inteligentes que se adaptan, predicen y evolucionan con tu negocio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-white">
        <HardwareProvider>
          <NeuralNetwork />
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <SmartChatbot />
        </HardwareProvider>
      </body>
    </html>
  );
}
