export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/generate',
    },
  });
}
