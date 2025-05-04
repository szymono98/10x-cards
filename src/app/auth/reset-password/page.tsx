'use client';

import { Button } from '@/components/ui/button';
import { AuthInput } from '@/components/auth/AuthInput';
import AuthLayout from '@/components/layouts/AuthLayout';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
        setError('root', {
          message: `Error while sending link: ${error.message}`,
        });
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('root', {
        message: 'An unexpected error occurred during password reset',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If an account exists with this email, we'll send you a password reset link."
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Click the link we just sent to your email address to set a new password. The link will
            be active for 24 hours. If you don&apos;t receive the email, please check your spam
            folder.
          </p>
          <Link
            href="/auth/login"
            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email address to receive a password reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}
