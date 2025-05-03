"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSupabase } from "@/lib/providers/supabase-provider";

export function Header() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { supabase, user } = useSupabase();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sets">Saved</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
