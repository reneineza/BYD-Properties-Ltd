import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProperties, getWhatsAppLeads } from '@/lib/db';
import { MessageCircle, Home, BarChart3, LogOut, ArrowUpRight } from 'lucide-react';

export default async function AgentDashboard() {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'agent') {
    redirect('/admin/login');
  }

  const agentId = session.user.id;
  const properties = await getProperties(agentId);
  const leads = await getWhatsAppLeads(agentId);

  const stats = [
    { label: 'My Listings', value: properties.length, icon: <Home className="w-5 h-5" />, color: 'bg-navy' },
    { label: 'My WhatsApp Leads', value: leads.length, icon: <MessageCircle className="w-5 h-5" />, color: 'bg-green-600' },
  ];

  const recentLeads = [...leads].slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar / Header */}
      <div className="bg-navy p-6 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center font-bold text-navy">
            {session.user.name[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold">Agent Workspace</h1>
            <p className="text-xs text-white/50">{session.user.email}</p>
          </div>
        </div>
        <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </Link>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="font-display text-3xl font-bold text-navy">Hello, {session.user.name}</h2>
          <p className="text-gray-500">Here is how your listings are performing.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-xl`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-navy mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Leads */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-navy">Recent Inquiries</h3>
              <Link href="/agent/leads" className="text-xs font-bold text-gold hover:underline">View all leads</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-navy">
                        {lead.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy">{lead.name}</p>
                        <p className="text-xs text-gray-400">{lead.properties?.title || 'General Inquiry'}</p>
                      </div>
                    </div>
                    <a 
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      className="text-[#25D366] hover:scale-110 transition-transform"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">No leads yet.</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-navy mb-6">Agent Tools</h3>
              <div className="space-y-3">
                <Link href="/agent/properties" className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all group">
                  <span className="text-sm font-bold text-navy group-hover:text-gold">My Properties</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gold" />
                </Link>
                <Link href="/agent/leads" className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gold hover:bg-gold/5 transition-all group">
                  <span className="text-sm font-bold text-navy group-hover:text-gold">WhatsApp Leads</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gold" />
                </Link>
              </div>
            </div>

            <div className="bg-gold/10 p-8 rounded-2xl border border-gold/20">
              <p className="text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">Need Help?</p>
              <p className="text-navy text-sm leading-relaxed">
                Contact the main administrator if you need to update your profile or have issues with your listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
