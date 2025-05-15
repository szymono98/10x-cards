import { RedirectType, redirect } from 'next/navigation';

export const runtime = 'edge';

// Optymalizacja dla statycznej generacji
export const dynamic = 'force-static';
export const revalidate = false;

export default function HomePage() {
  redirect('/generate', RedirectType.replace);
}
