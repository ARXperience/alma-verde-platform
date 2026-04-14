import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alma Verde - Diseño, Producción y Experiencias",
  description: "Agencia de diseño y productora especializada en stands, ferias, eventos, branding físico y decoración. Soluciones integrales con IA para empresas y hogares.",
  keywords: ["diseño", "stands", "ferias", "eventos", "decoración", "branding", "producción"],
  authors: [{ name: "Alma Verde" }],
  openGraph: {
    title: "Alma Verde - Diseño, Producción y Experiencias",
    description: "Agencia de diseño y productora especializada en stands, ferias, eventos y decoración",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
