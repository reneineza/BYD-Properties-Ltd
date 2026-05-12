import { SessionProvider } from '@/app/admin/SessionProvider';
import AgentShell from './AgentShell';

export const metadata = {
  title: {
    default: 'Agent Portal — BYD Properties',
    template: '%s | Agent Portal — BYD Properties',
  },
};

export default function AgentLayout({ children }) {
  return (
    <SessionProvider>
      <AgentShell>{children}</AgentShell>
    </SessionProvider>
  );
}
