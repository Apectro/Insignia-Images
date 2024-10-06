'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Clipboard, Check } from 'lucide-react';

const securitySchema = z.object({
  enableAuthKey: z.boolean(),
  authKey: z.string().min(1, 'Authorization Key is required when enabled'),
  allowedIPs: z.string().optional(),
});

type SecurityFormData = z.infer<typeof securitySchema>;

export default function SecurityTab() {
  const { data: session } = useSession();
  const [isCopied, setIsCopied] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      enableAuthKey: false,
      authKey: '',
      allowedIPs: '',
    },
  });

  const enableAuthKey = watch('enableAuthKey');
  const authKey = watch('authKey');

  useEffect(() => {
    // Fetch current settings when component mounts
    const fetchSettings = async () => {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setValue('enableAuthKey', data.enableAuthKey);
        setValue('authKey', data.authKey || '');
        setValue('allowedIPs', data.allowedIPs ? data.allowedIPs.join(', ') : '');
      }
    };
    fetchSettings();
  }, [setValue]);

  useEffect(() => {
    if (enableAuthKey && authKey) {
      setApiKey(`Bearer ${authKey}`);
    } else {
      setApiKey(null);
    }
  }, [enableAuthKey, authKey]);

  const onSubmit = async (data: SecurityFormData) => {
    const response = await fetch('/api/user/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        allowedIPs: data.allowedIPs ? data.allowedIPs.split(',').map((ip) => ip.trim()) : [],
      }),
    });

    if (response.ok) {
      toast({
        title: 'Settings updated',
        description: 'Your security settings have been successfully updated.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="enableAuthKey" className="text-right">
          Enable Authorization Key
        </Label>
        <Switch id="enableAuthKey" {...register('enableAuthKey')} />
      </div>

      {enableAuthKey && (
        <div>
          <Label htmlFor="authKey">Authorization Key</Label>
          <Input
            id="authKey"
            type="text"
            {...register('authKey')}
            className={errors.authKey ? 'border-red-500' : ''}
          />
          {errors.authKey && <p className="text-red-500">{errors.authKey.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="allowedIPs">Allowed IPs (comma-separated)</Label>
        <Input id="allowedIPs" type="text" {...register('allowedIPs')} />
      </div>

      {apiKey && (
        <div className="mt-4">
          <Label>API Key for Testing</Label>
          <div className="flex items-center mt-2">
            <Input type="text" value={apiKey} readOnly className="flex-grow mr-2" />
            <Button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center justify-center w-10 h-10"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      <Button type="submit">Save Settings</Button>
    </form>
  );
}
