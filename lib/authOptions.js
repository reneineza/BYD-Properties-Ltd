import CredentialsProvider from 'next-auth/providers/credentials';
import { getAgentByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
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
            if (credentials.email === adminEmail) {
              // Prefer bcrypt hash (ADMIN_PASSWORD should be a bcrypt hash).
              // Falls back to plain-text with a warning for legacy setups.
              const isHashed = adminPassword.startsWith('$2');
              let adminMatch = false;
              if (isHashed) {
                adminMatch = await bcrypt.compare(credentials.password, adminPassword);
              } else {
                console.warn(
                  '⚠️  SECURITY: ADMIN_PASSWORD is stored as plain text. ' +
                  'Please replace it with a bcrypt hash. ' +
                  'Generate one by running:\n' +
                  '  node -e "require(\'bcryptjs\').hash(\'YOUR_PASSWORD\', 12).then(h => console.log(h))"'
                );
                adminMatch = credentials.password === adminPassword;
              }
              if (adminMatch) {
                return { id: 'admin', name: 'Admin', email: adminEmail, role: 'admin' };
              }
            }
          } else {
            console.warn('Login Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in environment');
          }

          // 2. Check Agents table
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
    error: '/admin/login', 
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
