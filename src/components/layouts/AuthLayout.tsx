import { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="text-center space-y-6">
              <Link
                href="/"
                className="inline-block transform transition-transform hover:scale-105"
              >
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                  10x Cards
                </span>
              </Link>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
