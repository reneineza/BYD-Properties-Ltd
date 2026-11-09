import { SessionProvider } from '@/app/admin/SessionProvider';
import AgentShell from '../AgentShell';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getAgentById } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export const metadata = {
  title: {
    default: 'Agent Portal — BYD Properties',
    template: '%s | Agent Portal — BYD Properties',
  },
};

export default async function AgentLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || session?.user?.role !== 'agent') {
    redirect('/agent/login');
  }

  // Real-time security verification:
  // Agent must have verified email and must be approved by an administrator
  const agent = await getAgentById(session.user.id);
  if (!agent) {
    redirect('/agent/login');
  }

  if (!agent.email_verified_at || agent.status === 'email_pending') {
    redirect(`/agent/login?error=unverified&email=${encodeURIComponent(agent.email)}`);
  }

  if (agent.status === 'pending') {
    redirect('/agent/login?error=pending');
  }

  if (agent.status === 'rejected') {
    redirect(`/agent/login?error=rejected&reason=${encodeURIComponent(agent.rejection_reason || '')}`);
  }

  if (agent.status === 'suspended') {
    redirect('/agent/login?error=suspended');
  }

  if (agent.status !== 'approved' && agent.status !== 'active') {
    redirect('/agent/login');
  }

  return (
    <SessionProvider>
      <AgentShell>{children}</AgentShell>
    </SessionProvider>
  );
}
