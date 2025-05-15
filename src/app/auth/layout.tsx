import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | 10x Cards',
  description: 'Sign in or create an account for 10x Cards',
};

export const runtime = 'edge';
export const preferredRegion = 'all';
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
