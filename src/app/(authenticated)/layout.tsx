'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MainNav } from '@/components/layout/MainNav';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-stone-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render content (will redirect)
  if (!user && !isLoading) {
    return null;
  }

  // Render layout for authenticated users
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container px-4 py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-10 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} NetworkApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}