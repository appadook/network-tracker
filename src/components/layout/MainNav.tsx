'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function MainNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
      console.error(error);
    }
  };

  const navItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Network', href: '/network' },
    { title: 'Applications', href: '/applications' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6 w-full">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              NetworkApp
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href
                    ? 'text-foreground font-bold'
                    : 'text-foreground/60'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}