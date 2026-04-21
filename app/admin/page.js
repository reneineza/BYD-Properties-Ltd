import Link from 'next/link';
import { getProperties, getInquiries, getAgents, getWhatsAppLeads } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const properties = await getProperties();
  const inquiries = await getInquiries();
  const agents = await getAgents();
  const leads = await getWhatsAppLeads();

  const unread = inquiries.filter((i) => !i.read).length;
  const pendingAgents = agents.filter((a) => a.status === 'pending').length;
  const forSale = properties.filter((p) => p.status === 'for-sale').length;
  const forRent = properties.filter((p) => p.status === 'for-rent').length;

  const stats = [
    {
      label: 'Total Properties',
      value: properties.length,
      sub: `${forSale} for sale · ${forRent} for rent`,
      href: '/admin/properties',
      color: 'bg-navy',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: 'CRM Leads',
      value: leads.length,
      sub: 'via WhatsApp button',
      href: '/admin/leads',
      color: 'bg-green-600',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      label: 'Inquiries',
      value: inquiries.length,
      sub: `${unread} unread`,
      href: '/admin/inquiries',
      color: 'bg-gold',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Agent Applications',
      value: agents.length,
      sub: `${pendingAgents} pending review`,
      href: '/admin/agents',
      color: 'bg-navy-light',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
  ];

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} text-white p-3`}>
                {stat.icon}
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="font-display text-4xl font-bold text-navy mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-navy mb-1">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="bg-white shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display font-bold text-navy text-lg">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-gold font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="px-6 py-4 flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!inq.read ? 'bg-gold' : 'bg-gray-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{inq.name}</p>
                    <p className="text-xs text-gray-400 truncate">{inq.subject || inq.message.slice(0, 50)}</p>
                  </div>
                  <time className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </time>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No inquiries yet.</div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-display font-bold text-navy text-lg">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-3">
            {[
              { href: '/admin/properties/new', label: 'Add New Property', icon: '+' },
              { href: '/admin/inquiries', label: `Review Inquiries (${unread} unread)`, icon: '✉' },
              { href: '/admin/agents', label: `Agent Applications (${pendingAgents} pending)`, icon: '👤' },
              { href: '/admin/content', label: 'Edit Page Content', icon: '✏' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-4 border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all duration-200 group"
              >
                <span className="text-gold text-xl w-8 text-center">{action.icon}</span>
                <span className="text-sm font-medium text-navy group-hover:text-gold transition-colors">
                  {action.label}
                </span>
                <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
