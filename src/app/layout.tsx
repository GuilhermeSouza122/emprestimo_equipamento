import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Equipar | Empréstimo de equipamentos",
  description: "Consulte, solicite e devolva equipamentos internos com clareza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
