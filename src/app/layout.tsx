import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mustafa Çakır Restaurant | Geleneksel Lezzetler",
  description:
    "2002'den beri Mustafa Çakır Restaurant'ta geleneksel Türk lezzetleri sizi bekliyor.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${playfair.variable} ${lato.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
