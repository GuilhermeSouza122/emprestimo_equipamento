import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Emprestimo de equipamentos",
  description: "Fatia zero do sistema interno de emprestimos.",
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
