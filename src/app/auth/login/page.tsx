'use client';

import { Button } from '@/components/ui/button';
import { AuthInput } from '@/components/auth/AuthInput';
import AuthLayout from '@/components/layouts/AuthLayout';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('root', {
            message: "Invalid email or password. If you don't have an account yet, sign up.",
          });
        } else {
          setError('root', {
            message: `An error occurred during login: ${error.message}`,
          });
        }
        return;
      }

      router.push('/generate');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError('root', {
        message: 'An unexpected error occurred during login',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Log in to your account"
      subtitle="Or create a new account if you don't have one"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <AuthInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            registration={register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email format',
              },
            })}
            error={errors.email?.message}
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            registration={register('password', {
              required: 'Password is required',
            })}
            error={errors.password?.message}
          />
        </div>

        {errors.root && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
            {errors.root.message}
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/auth/reset-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Link
          href="/auth/register"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </form>
    </AuthLayout>
  );
}
