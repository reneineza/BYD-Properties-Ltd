'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, MessageCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AgentShell({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session || session.user?.role !== 'agent') {
    return <div className="p-12 text-center text-gray-500">Loading workspace...</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/agent', icon: LayoutDashboard },
    { name: 'My Properties', href: '/agent/properties', icon: Home },
    { name: 'WhatsApp Leads', href: '/agent/leads', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-navy text-white p-4 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-bold text-navy text-sm">
            {session.user.name?.[0] || 'A'}
          </div>
          <span className="font-bold">Agent Portal</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white/80 hover:text-white">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-navy text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col shadow-xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Desktop Header */}
        <div className="hidden md:flex p-6 items-center gap-4 border-b border-white/10">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center font-bold text-navy text-lg shadow-[0_0_15px_rgba(223,159,61,0.3)]">
            {session.user.name?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold truncate text-white">{session.user.name}</h1>
            <p className="text-xs text-white/50 truncate uppercase tracking-widest mt-0.5">Agent</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/agent' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gold text-navy font-bold shadow-[0_4px_12px_rgba(223,159,61,0.2)]' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-navy' : 'text-white/50'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Overlay (Mobile) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-0 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
