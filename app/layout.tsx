import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/nav/Sidebar";
import { DataProvider } from "@/lib/data-context";

export const metadata: Metadata = {
  title: "Budgetting Tool",
  description: "Your personal budgeting companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <Sidebar />
          <main className="md:ml-60 min-h-screen pb-20 md:pb-0">
            <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
              {children}
            </div>
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
