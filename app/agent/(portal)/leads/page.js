import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getWhatsAppLeads } from '@/lib/db';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AgentLeadsPage() {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'agent') {
    redirect('/admin/login');
  }

  const leads = await getWhatsAppLeads(session.user.id);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">WhatsApp Leads</h1>
          <p className="text-gray-500 mt-1">Inquiries for your properties</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {leads.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Property</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center font-bold text-navy shrink-0">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-navy">{lead.name}</p>
                        <p className="text-gray-500 text-xs">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell max-w-[250px]">
                    {lead.properties ? (
                      <Link href={`/properties/${lead.property_id}`} target="_blank" className="text-gold hover:underline font-medium truncate block">
                        {lead.properties.title}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">General Inquiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1ebd5b] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-navy text-lg mb-1">No leads yet</h3>
            <p className="text-gray-500">When users contact you about your properties via WhatsApp, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
