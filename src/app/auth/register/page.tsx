'use client';

import { Button } from '@/components/ui/button';
import { AuthInput } from '@/components/auth/AuthInput';
import AuthLayout from '@/components/layouts/AuthLayout';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

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
  const password = watch('password');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        setIsLoading(true);
        const redirectUrl = new URL('/auth/callback', window.location.origin);
        redirectUrl.searchParams.append('registration', 'true');

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
          if (signUpError.message.includes('already registered')) {
            setError('email', {
              message: 'This email is already registered',
            });
          } else {
            setError('root', {
              message: `An error occurred during registration: ${signUpError.message}`,
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
        console.error('Registration error:', error);
        setError('root', {
          message: 'An unexpected error occurred during registration',
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
        title="Check your email"
        subtitle="We've sent a confirmation link to your email address"
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            To complete your registration, click the link we just sent to your email address. If you
            don&apos;t receive the email within a few minutes, please check your spam folder.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            className="w-full font-medium"
          >
            Go to login page
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create an account" subtitle="Or sign in if you already have an account">
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
            registration={register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            error={errors.password?.message}
          />

          <AuthInput
            id="confirmPassword"
            label="Confirm password"
            type="password"
            registration={register('confirmPassword', {
              required: 'Password confirmation is required',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
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
          href="/auth/login"
          className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
