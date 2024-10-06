import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const usersCollection = client.db().collection('users');
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          allowedIPs: user.allowedIPs || [],
          enableAuthKey: user.enableAuthKey || false,
          authKey: user.authKey || '',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.allowedIPs = user.allowedIPs;
        token.enableAuthKey = user.enableAuthKey;
        token.authKey = user.authKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.allowedIPs = token.allowedIPs as string[];
        session.user.enableAuthKey = token.enableAuthKey as boolean;
        session.user.authKey = token.authKey as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};
