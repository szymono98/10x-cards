"use client";

import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const password = watch("password");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        setIsLoading(true);
        const redirectUrl = new URL("/auth/callback", window.location.origin);
        redirectUrl.searchParams.append("registration", "true");

        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl.toString(),
            data: {
              email: data.email,
              registration: true,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            setError("email", {
              message: "Ten adres email jest już zarejestrowany",
            });
          } else {
            setError("root", {
              message: `Wystąpił błąd podczas rejestracji: ${signUpError.message}`,
            });
          }
          return;
        }

        await Promise.all([
          supabase.auth.signOut(),
          new Promise((resolve) => setTimeout(resolve, 100)),
        ]);

        setIsSuccess(true);
      } catch (error) {
        console.error("Registration error:", error);
        setError("root", {
          message: "Wystąpił nieoczekiwany błąd podczas rejestracji",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth, setError]
  );

  useEffect(() => {
    const checkAndSignOut = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
    };

    checkAndSignOut();
  }, [supabase.auth]);

  if (isSuccess) {
    return (
      <AuthLayout
        title="Sprawdź swoją skrzynkę email"
        subtitle="Wysłaliśmy link potwierdzający na podany adres email"
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Aby dokończyć rejestrację, kliknij w link, który właśnie wysłaliśmy
            na Twój adres email. Jeśli nie otrzymałeś wiadomości w ciągu kilku
            minut, sprawdź folder spam.
          </p>
          <Button
            onClick={() => router.push("/auth/login")}
            variant="outline"
            className="w-full font-medium"
          >
            Przejdź do strony logowania
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Utwórz konto"
      subtitle="Lub zaloguj się jeśli masz już konto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <AuthInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            registration={register("email", {
              required: "Email jest wymagany",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Nieprawidłowy format email",
              },
            })}
            error={errors.email?.message}
          />

          <AuthInput
            id="password"
            label="Hasło"
            type="password"
            registration={register("password", {
              required: "Hasło jest wymagane",
              minLength: {
                value: 8,
                message: "Hasło musi mieć minimum 8 znaków",
              },
            })}
            error={errors.password?.message}
          />

          <AuthInput
            id="confirmPassword"
            label="Potwierdź hasło"
            type="password"
            registration={register("confirmPassword", {
              required: "Potwierdzenie hasła jest wymagane",
              validate: (value) =>
                value === password || "Hasła nie są identyczne",
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
              lub
            </span>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Masz już konto? Zaloguj się
        </Link>
      </form>
    </AuthLayout>
  );
}
