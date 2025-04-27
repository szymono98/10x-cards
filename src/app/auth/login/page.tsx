"use client";

import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import AuthLayout from "@/components/layouts/AuthLayout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    // Backend implementation will be added later
    console.log("Form submitted:", data);
  };

  return (
    <AuthLayout
      title="Zaloguj się do konta"
      subtitle="Lub utwórz nowe konto jeśli jeszcze nie masz"
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
            autoComplete="current-password"
            registration={register("password", {
              required: "Hasło jest wymagane",
            })}
            error={errors.password?.message}
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/reset-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Zapomniałeś hasła?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          {isLoading ? "Logowanie..." : "Zaloguj się"}
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
          href="/auth/register"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Nie masz jeszcze konta? Zarejestruj się
        </Link>
      </form>
    </AuthLayout>
  );
}
