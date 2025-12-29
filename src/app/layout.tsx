import type { Metadata } from "next";
import { DataProvider } from "@/contexts/DataContext";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akademik yozuv virtual laboratoriyasi",
  description:
    "Imlo va akademik yozuv ko'nikmalaringizni interaktiv testlar orqali rivojlantiring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        <DataProvider>
          <Toaster />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
