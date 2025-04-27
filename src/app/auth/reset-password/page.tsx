"use client";

import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ResetPasswordFormData {
  email: string;
}

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setError("root", {
          message: `Wystąpił błąd podczas wysyłania linku: ${error.message}`,
        });
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("root", {
        message: "Wystąpił nieoczekiwany błąd podczas resetowania hasła",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Sprawdź swoją skrzynkę email"
        subtitle="Jeśli konto o podanym adresie email istnieje, wyślemy Ci link do zresetowania hasła."
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Kliknij w link, który właśnie wysłaliśmy na Twój adres email, aby
            ustawić nowe hasło. Link będzie aktywny przez 24 godziny. Jeśli nie
            otrzymałeś wiadomości, sprawdź folder spam.
          </p>
          <Link
            href="/auth/login"
            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Powrót do logowania
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Resetuj hasło"
      subtitle="Wprowadź swój adres email, aby otrzymać link do resetowania hasła"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>
      </form>
    </AuthLayout>
  );
}
