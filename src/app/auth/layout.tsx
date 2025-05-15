import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | 10x Cards',
  description: 'Sign in or create an account for 10x Cards',
};

// Optymalizacja dla statycznej generacji
export const dynamic = 'force-static';
export const revalidate = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
