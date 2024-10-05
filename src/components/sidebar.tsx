'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('lucide-react').then((mod) => mod.Home), { ssr: false });
const Upload = dynamic(() => import('lucide-react').then((mod) => mod.Upload), { ssr: false });
const ImageIcon = dynamic(() => import('lucide-react').then((mod) => mod.Image), { ssr: false });
const Settings = dynamic(() => import('lucide-react').then((mod) => mod.Settings), { ssr: false });
const LogOut = dynamic(() => import('lucide-react').then((mod) => mod.LogOut), { ssr: false });
const Moon = dynamic(() => import('lucide-react').then((mod) => mod.Moon), { ssr: false });
const Sun = dynamic(() => import('lucide-react').then((mod) => mod.Sun), { ssr: false });
const User = dynamic(() => import('lucide-react').then((mod) => mod.User), { ssr: false });
const CreditCard = dynamic(() => import('lucide-react').then((mod) => mod.CreditCard), { ssr: false });
const HelpCircle = dynamic(() => import('lucide-react').then((mod) => mod.HelpCircle), { ssr: false });

const mainNavItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/upload', icon: Upload, label: 'Upload' },
  { href: '/dashboard/images', icon: ImageIcon, label: 'My Images' },
];

const secondaryNavItems = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-64 bg-card h-full border-r flex flex-col">
      <div className="p-6 flex items-center space-x-2">
        <ImageIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Insignia</h1>
      </div>
      <ScrollArea className="flex-grow px-4">
        <nav className="space-y-6 py-4">
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main</h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
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
                <Link key={item.href} href={item.href}>
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
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
          <Button onClick={() => signOut()} variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
