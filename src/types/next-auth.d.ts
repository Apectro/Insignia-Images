import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      allowedIPs?: string[];
      enableAuthKey?: boolean;
      authKey?: string;
    };
  }

  interface User {
    allowedIPs?: string[];
    enableAuthKey?: boolean;
    authKey?: string;
  }
}
