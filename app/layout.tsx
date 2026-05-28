import type { Metadata } from 'next';
import './globals.css';
import NavBar from '../components/NavBar';
import ThemeToggle from '../components/ThemeToggle';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'MyCloud',
  description: 'A cloud storage application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        <AuthProvider>
          <NavBar />
          {children}
          <ThemeToggle />
        </AuthProvider>
      </body>
    </html>
  );
}
