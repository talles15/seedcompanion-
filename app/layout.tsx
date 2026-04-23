import "./globals.css";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SeedCompanion",
  description: "Visualização de lotes de sementes de soja",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <AppHeader userEmail={user?.email ?? null} />
        <main className="flex-1 container mx-auto px-6 py-6 max-w-7xl w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
