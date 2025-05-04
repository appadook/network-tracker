'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Menu, X } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 sm:px-6 w-full">
        <Link href="/dashboard" className="flex items-center space-x-2 mr-4">
          <span className="font-bold">NetworkApp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto mr-4"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* User Profile/Sign Out */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
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

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border">
          <div className="flex flex-col space-y-3 px-6 py-4">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={`mobile-${item.href}`}
                className={`py-2 ${
                  pathname === item.href
                    ? 'text-foreground font-bold'
                    : 'text-foreground/60'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mt-2"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}