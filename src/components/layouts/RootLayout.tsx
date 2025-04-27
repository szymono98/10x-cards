import { Header } from "./Header";

interface RootLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export function RootLayout({ children, hideHeader = false }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!hideHeader && <Header />}
      <main>{children}</main>
    </div>
  );
}
