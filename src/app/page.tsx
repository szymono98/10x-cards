import { RedirectType, redirect } from 'next/navigation';

// Używamy tylko Edge Runtime bez force-static
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function HomePage() {
  redirect('/generate', RedirectType.replace);
}
