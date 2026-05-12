import { SessionProvider } from '@/app/admin/SessionProvider';
import AgentShell from './AgentShell';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: {
    default: 'Agent Portal — BYD Properties',
    template: '%s | Agent Portal — BYD Properties',
  },
};

export default async function AgentLayout({ children }) {
  const session = await getServerSession();

  if (!session || session?.user?.role !== 'agent') {
    redirect('/agent/login');
  }

  return (
    <SessionProvider>
      <AgentShell>{children}</AgentShell>
    </SessionProvider>
  );
}
