import { SessionProvider } from './SessionProvider';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: {
    default: 'Admin — BYD Properties',
    template: '%s | Admin — BYD Properties',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession();

  // If an agent tries to access the admin portal, redirect them to their portal
  if (session?.user?.role === 'agent') {
    redirect('/agent');
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
