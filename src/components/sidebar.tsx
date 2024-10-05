'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const IconHome = dynamic(() => import('lucide-react').then((mod) => mod.Home), { ssr: false });
const IconUpload = dynamic(() => import('lucide-react').then((mod) => mod.Upload), { ssr: false });
const IconImage = dynamic(() => import('lucide-react').then((mod) => mod.Image), { ssr: false });
const IconSettings = dynamic(() => import('lucide-react').then((mod) => mod.Settings), { ssr: false });
const IconLogOut = dynamic(() => import('lucide-react').then((mod) => mod.LogOut), { ssr: false });
const IconMoon = dynamic(() => import('lucide-react').then((mod) => mod.Moon), { ssr: false });
const IconSun = dynamic(() => import('lucide-react').then((mod) => mod.Sun), { ssr: false });
const IconUser = dynamic(() => import('lucide-react').then((mod) => mod.User), { ssr: false });
const IconCreditCard = dynamic(() => import('lucide-react').then((mod) => mod.CreditCard), { ssr: false });
const IconHelpCircle = dynamic(() => import('lucide-react').then((mod) => mod.HelpCircle), { ssr: false });
const IconFile = dynamic(() => import('lucide-react').then((mod) => mod.File), { ssr: false });
const IconMenu = dynamic(() => import('lucide-react').then((mod) => mod.Menu), { ssr: false });

const mainNavItems = [
  { href: '/dashboard', icon: IconHome, label: 'Dashboard' },
  { href: '/dashboard/my-images', icon: IconImage, label: 'My Images' },
  { href: '/dashboard/files', icon: IconFile, label: 'My Files' },
];

const secondaryNavItems = [{ href: '/dashboard/settings', icon: IconSettings, label: 'Settings' }];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center space-x-2">
        <IconImage className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Insignia</h1>
      </div>
      <ScrollArea className="flex-grow px-4">
        <nav className="space-y-6 py-4">
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main</h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Settings</h2>
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4 px-2">
          <Avatar>
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon">
            <IconHelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
          <Button onClick={() => signOut()} variant="ghost" size="icon">
            <IconLogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <IconMenu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex w-64 bg-card h-full border-r flex-col">
        <SidebarContent />
      </div>
    </>
  );
}
