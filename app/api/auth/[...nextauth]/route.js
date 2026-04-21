import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getAgentByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Login Error: Missing credentials');
            return null;
          }

          // 1. Check Admin (env vars)
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (adminEmail && adminPassword) {
            if (credentials.email === adminEmail && credentials.password === adminPassword) {
              return { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' };
            }
          } else {
            console.warn('Login Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment');
          }

          // 2. Check Agents table
          // We wrap this in a try-catch to prevent a DB error from crashing the whole login
          let agent = null;
          try {
            agent = await getAgentByEmail(credentials.email);
          } catch (dbError) {
            console.error('Login Error: Database lookup failed', dbError);
          }

          if (agent && agent.password && agent.status === 'active') {
            const isValid = await bcrypt.compare(credentials.password, agent.password);
            if (isValid) {
              return { 
                id: agent.id, 
                name: agent.name, 
                email: agent.email, 
                role: 'agent' 
              };
            }
          }

          console.warn('Login Failed: Invalid email or password for:', credentials.email);
          return null;
        } catch (error) {
          console.error('Critical Login Error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login', // Redirect errors back to login page
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-debug-only',
});

export { handler as GET, handler as POST };
