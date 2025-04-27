import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  const isLoggedIn = false; // TODO: Replace with actual auth state

  return (
    <header className="border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text"
        >
          10x Cards
        </Link>

        <nav className="flex gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sets">Moje zestawy</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profil</Link>
              </Button>
              <Button variant="outline">Wyloguj</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Zaloguj</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Zarejestruj</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
