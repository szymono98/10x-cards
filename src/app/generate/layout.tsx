import { RootLayout } from '@/components/layouts/RootLayout';

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
