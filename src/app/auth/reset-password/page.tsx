"use client";

import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface ResetPasswordFormData {
  email: string;
}

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Backend implementation will be added later
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Sprawdź swoją skrzynkę"
        subtitle="Jeśli konto o podanym adresie email istnieje, otrzymasz wiadomość z instrukcją resetowania hasła."
      >
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
