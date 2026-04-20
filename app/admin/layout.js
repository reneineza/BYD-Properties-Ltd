import { SessionProvider } from './SessionProvider';
import AdminShell from './AdminShell';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: {
    default: 'Admin — BYD Properties',
    template: '%s | Admin — BYD Properties',
  },
};

export default async function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
