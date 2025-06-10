'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useProgress } from '@/components/progress-context';
import { ProgressBar } from '@/components/progress-bar';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Research', href: '/research' },
];

export function Header() {
  const { current, total, showProgress } = useProgress();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <span className="font-bold text-lg text-foreground/100 hover:text-foreground/80 transition-colors">values.md</span>
        </Link>

        {/* Desktop Navigation & Theme Toggle */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <ModeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Navigate through the values.md platform
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-2 py-1 text-lg hover:text-foreground/80 text-foreground/60 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </div>
        
        {/* Progress Slot */}
        {showProgress && (
          <div className="pb-4">
            <ProgressBar current={current} total={total} />
          </div>
        )}
      </div>
    </header>
  );
}