import Link from "next/link";
import { LogOut, LogIn, Sprout } from "lucide-react";

type Props = { userEmail: string | null };

export function AppHeader({ userEmail }: Props) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto max-w-7xl px-6 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sprout className="h-5 w-5 text-brand-green" />
          <span>SeedCompanion</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-brand-green">
            Lotes
          </Link>
          <Link href="/tendencias" className="hover:text-brand-green">
            Tendências
          </Link>
          {userEmail && (
            <Link href="/configuracoes" className="hover:text-brand-green">
              Configurações
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {userEmail ? (
            <>
              <span className="text-gray-600 hidden sm:inline">
                {userEmail}
              </span>
              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-brand-green"
            >
              <LogIn className="h-4 w-4" /> Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
