import { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Authentication | 10x Cards',
  description: 'Sign in or create an account for 10x Cards',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
