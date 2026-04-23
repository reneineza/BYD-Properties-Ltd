import Link from 'next/link';
import { getProperties, getInquiries, getAgents, getWhatsAppLeads } from '@/lib/db';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const [properties, inquiries, agents, leads] = await Promise.all([
    getProperties(),
    getInquiries(),
    getAgents(),
    getWhatsAppLeads(),
  ]);

  const unread = inquiries.filter((i) => !i.read).length;
  const pendingAgents = agents.filter((a) => a.status === 'pending').length;
  const pendingProperties = properties.filter((p) => !p.is_approved).length;
  const forSale = properties.filter((p) => (p.status === 'for-sale' || p.status === 'for-sale-and-rent') && p.is_approved).length;
  const forRent = properties.filter((p) => (p.status === 'for-rent' || p.status === 'for-sale-and-rent') && p.is_approved).length;

  const stats = [
    {
      label: 'Total Properties',
      value: properties.length,
      sub: `${forSale} live · ${pendingProperties} pending`,
      href: '/admin/properties',
      color: 'bg-navy',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: 'Pending Review',
      value: pendingProperties,
      sub: 'Needs admin approval',
      href: '/admin/properties?filter=pending',
      color: 'bg-orange-500',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
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
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      label: 'New Inquiries',
      value: unread,
      sub: 'Waitlist & Direct',
      href: '/admin/inquiries',
      color: 'bg-gold',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ];

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <AdminShell>
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
              </div>
              <div className="text-3xl font-bold text-navy mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-400 group-hover:text-gold transition-colors">{stat.label}</div>
              <div className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">{stat.sub}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inquiries */}
          <div className="bg-white shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-navy uppercase tracking-wider text-sm">Recent Direct Inquiries</h2>
              <Link href="/admin/inquiries" className="text-xs text-gold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((iq) => (
                  <div key={iq.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-semibold text-navy text-sm">{iq.name}</div>
                      <div className="text-xs text-gray-400">{iq.email}</div>
                    </div>
                    {!iq.read && <span className="w-2 h-2 bg-gold rounded-full"></span>}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No inquiries yet</div>
              )}
            </div>
          </div>

          {/* Recent WhatsApp Leads */}
          <div className="bg-white shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-navy uppercase tracking-wider text-sm">Recent CRM Leads</h2>
              <Link href="/admin/leads" className="text-xs text-gold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-semibold text-navy text-sm">{lead.name}</div>
                      <div className="text-xs text-gray-400">{lead.phone}</div>
                    </div>
                    <div className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 font-bold uppercase">WhatsApp</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No leads yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
