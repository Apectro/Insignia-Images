// app/dashboard/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [allowedIPs, setAllowedIPs] = useState('');
  const [enableAuthKey, setEnableAuthKey] = useState(false);
  const [authKey, setAuthKey] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          setAllowedIPs(data.allowedIPs.join(', '));
          setEnableAuthKey(data.enableAuthKey);
          setAuthKey(data.authKey || '');
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowedIPs: allowedIPs.split(',').map((ip) => ip.trim()),
          enableAuthKey,
          authKey,
        }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Settings saved successfully' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  if (!session) {
    return <div>Please sign in to view settings.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
          {/* Add your existing account settings here */}
        </TabsContent>
        <TabsContent value="security">
          <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="allowed-ips">Allowed IPs (comma-separated)</Label>
              <Input
                id="allowed-ips"
                value={allowedIPs}
                onChange={(e) => setAllowedIPs(e.target.value)}
                placeholder="e.g. 192.168.1.1, 10.0.0.1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="enable-auth-key" checked={enableAuthKey} onCheckedChange={setEnableAuthKey} />
              <Label htmlFor="enable-auth-key">Enable Authorization Key</Label>
            </div>
            {enableAuthKey && (
              <div>
                <Label htmlFor="auth-key">Authorization Key</Label>
                <Input
                  id="auth-key"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  placeholder="Enter authorization key"
                />
              </div>
            )}
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
