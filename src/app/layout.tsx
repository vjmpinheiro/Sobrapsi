import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://sobrapsi.org.br"
  ),
  title: {
    default: "SOBRAPSI — Sociedade Brasileira de Psicanálise",
    template: "%s | SOBRAPSI",
  },
  description:
    "Sociedade psicanalítica dedicada à formação continuada, ética, supervisão e fortalecimento da prática psicanalítica no Brasil.",
  keywords: [
    "psicanálise",
    "SOBRAPSI",
    "sociedade psicanalítica",
    "formação continuada",
    "supervisão",
    "ética",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "SOBRAPSI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} min-h-screen bg-black antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
