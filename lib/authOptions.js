import CredentialsProvider from 'next-auth/providers/credentials';
import { getAgentByEmailOrPhone } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Login',
      credentials: {
        email: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Login Error: Missing credentials');
            throw new Error('INVALID_CREDENTIALS');
          }

          const identifier = credentials.email.trim();

          // 1. Check Admin (env vars)
          const adminEmail = process.env.ADMIN_EMAIL;
          const adminPassword = process.env.ADMIN_PASSWORD;

          if (adminEmail && adminPassword) {
            if (identifier.toLowerCase() === adminEmail.toLowerCase()) {
              const isHashed = adminPassword.startsWith('$2');
              let adminMatch = false;
              if (isHashed) {
                adminMatch = await bcrypt.compare(credentials.password, adminPassword);
              } else {
                adminMatch = credentials.password === adminPassword;
              }
              if (adminMatch) {
                return { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' };
              }
            }
          }

          // 2. Check Agents table (by Email or Phone number)
          let agent = null;
          try {
            agent = await getAgentByEmailOrPhone(identifier);
          } catch (dbError) {
            console.error('Login Error: Database lookup failed', dbError);
          }

          if (!agent || !agent.password) {
            console.warn('Login Failed: No account found for:', identifier);
            throw new Error('INVALID_CREDENTIALS');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, agent.password);
          if (!isValidPassword) {
            console.warn('Login Failed: Incorrect password for:', identifier);
            throw new Error('INVALID_CREDENTIALS');
          }

          // Check Email Verification
          if (!agent.email_verified_at || agent.status === 'email_pending') {
            console.warn('Login Blocked: Email not verified for:', agent.email);
            throw new Error(`EMAIL_NOT_VERIFIED:${agent.email}`);
          }

          // Check Account Approval Status
          if (agent.status === 'pending') {
            console.warn('Login Blocked: Account awaiting approval for:', agent.email);
            throw new Error('ACCOUNT_PENDING');
          }

          if (agent.status === 'rejected') {
            console.warn('Login Blocked: Account rejected for:', agent.email);
            const reason = agent.rejection_reason || 'Application does not meet our current requirements.';
            throw new Error(`ACCOUNT_REJECTED:${reason}`);
          }

          if (agent.status === 'suspended') {
            console.warn('Login Blocked: Account suspended for:', agent.email);
            throw new Error('ACCOUNT_SUSPENDED');
          }

          if (agent.status === 'approved' || agent.status === 'active') {
            return { 
              id: agent.id, 
              name: agent.name || agent.full_name, 
              email: agent.email, 
              role: 'agent' 
            };
          }

          // Any other unrecognized status
          throw new Error('ACCOUNT_PENDING');
        } catch (error) {
          // Re-throw our custom errors so NextAuth client can inspect them
          if (error.message && (
            error.message.startsWith('EMAIL_NOT_VERIFIED') ||
            error.message === 'ACCOUNT_PENDING' ||
            error.message.startsWith('ACCOUNT_REJECTED') ||
            error.message === 'ACCOUNT_SUSPENDED' ||
            error.message === 'INVALID_CREDENTIALS'
          )) {
            throw error;
          }
          console.error('Critical Login Error:', error);
          throw new Error('INVALID_CREDENTIALS');
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
    error: '/admin/login', 
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
