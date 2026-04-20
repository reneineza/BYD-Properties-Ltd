import { getProperties, getInquiries, getAgents, getPageViews } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics Dashboard' };

// --- helpers ---
function buildDailyBuckets(days) {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: d.toISOString().slice(0, 10),
      views: 0,
      sessions: new Set(),
    });
  }
  return buckets;
}

function buildMonthBuckets() {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: monthNames[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), properties: 0, inquiries: 0 });
  }
  return months;
}

export default function AnalyticsDashboard() {
  const properties = getProperties();
  const inquiries  = getInquiries();
  const agents     = getAgents();
  const pageViews  = getPageViews();

  // ── CMS metrics ──────────────────────────────────────────────────
  const totalProperties  = properties.length;
  const totalInquiries   = inquiries.length;
  const totalAgents      = agents.length;
  const unreadInquiries  = inquiries.filter((i) => !i.read).length;
  const featured         = properties.filter((p) => p.featured).length;
  const conversionRate   = totalProperties > 0 ? Math.round((totalInquiries / totalProperties) * 10) / 10 : 0;

  // ── Monthly buckets for CMS charts ──────────────────────────────
  const months = buildMonthBuckets();
  properties.forEach((p) => {
    if (!p.createdAt) return;
    const d = new Date(p.createdAt);
    const m = months.find((mo) => mo.year === d.getFullYear() && mo.month === d.getMonth());
    if (m) m.properties++;
  });
  inquiries.forEach((inq) => {
    if (!inq.createdAt) return;
    const d = new Date(inq.createdAt);
    const m = months.find((mo) => mo.year === d.getFullYear() && mo.month === d.getMonth());
    if (m) m.inquiries++;
  });
  const maxProps = Math.max(...months.map((m) => m.properties), 1);
  const maxInq   = Math.max(...months.map((m) => m.inquiries), 1);

  // ── Property status donut ────────────────────────────────────────
  const forSale = properties.filter((p) => p.status === 'for-sale').length;
  const forRent = properties.filter((p) => p.status === 'for-rent').length;
  const other   = Math.max(0, totalProperties - forSale - forRent);
  const tot     = totalProperties || 1;
  const arc     = (val) => `${(val / tot) * 100} ${100 - (val / tot) * 100}`;
  const offsetSale  = 25;
  const offsetRent  = 25 - (forSale / tot) * 100;
  const offsetOther = 25 - ((forSale + forRent) / tot) * 100;

  // ── Traffic metrics ──────────────────────────────────────────────
  const totalPageViews   = pageViews.length;
  const uniqueSessions   = new Set(pageViews.map((v) => v.sessionId).filter(Boolean)).size;

  // Daily traffic — last 7 days
  const daily = buildDailyBuckets(7);
  pageViews.forEach((v) => {
    const dateStr = v.timestamp?.slice(0, 10);
    const bucket  = daily.find((b) => b.dateStr === dateStr);
    if (!bucket) return;
    bucket.views++;
    if (v.sessionId) bucket.sessions.add(v.sessionId);
  });
  const maxViews = Math.max(...daily.map((d) => d.views), 1);

  // Serialize sessions count (Sets can't be passed to JSX)
  const dailyData = daily.map((d) => ({ label: d.label, views: d.views, sessions: d.sessions.size }));

  // Top pages — last 30 days
  const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const recent30 = pageViews.filter((v) => v.timestamp >= cutoff30);
  const pageCounts = {};
  recent30.forEach((v) => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  // Today's views
  const todayStr  = new Date().toISOString().slice(0, 10);
  const todayViews = pageViews.filter((v) => v.timestamp?.startsWith(todayStr)).length;

  // Build simple SVG polyline points for line chart (300×80 viewBox)
  const W = 300; const H = 80;
  const pts = dailyData.map((d, i) => {
    const x = (i / Math.max(dailyData.length - 1, 1)) * W;
    const y = H - Math.max((d.views / maxViews) * H, 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy">Analytics</h1>
        <p className="text-gray-500 mt-1">Platform performance and site traffic at a glance.</p>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 1 — CMS KPIs
      ══════════════════════════════════════════════ */}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Content Overview</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-navy p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-4xl font-display font-bold text-navy">{totalProperties}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Total Properties</p>
          <p className="text-xs text-gray-400 mt-1">{featured} featured on homepage</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gold p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
            </div>
            {unreadInquiries > 0 && (
              <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">{unreadInquiries} new</span>
            )}
          </div>
          <p className="text-4xl font-display font-bold text-navy">{totalInquiries}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Total Inquiries</p>
          <p className="text-xs text-gray-400 mt-1">{unreadInquiries} unread messages</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-navy/80 p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-navy">{totalAgents}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Agent Applications</p>
          <p className="text-xs text-gray-400 mt-1">{agents.filter((a) => a.status === 'pending').length} pending review</p>
        </div>

        <div className="bg-navy border border-navy shadow-sm p-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="mb-3">
              <div className="bg-gold/20 p-2 inline-block">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" /></svg>
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-gold">{conversionRate}x</p>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mt-1">Inquiry Rate</p>
            <p className="text-xs text-white/40 mt-1">Avg inquiries per property</p>
          </div>
        </div>
      </div>

      {/* CMS Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Inquiries bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-navy text-lg">Inquiries — Last 6 Months</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm bg-navy inline-block" /> Inquiries
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {months.map((m, i) => {
              const pct = Math.max((m.inquiries / maxInq) * 100, 3);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs font-semibold text-navy opacity-0 group-hover:opacity-100 transition-opacity">{m.inquiries}</span>
                  <div className="w-full flex justify-center" style={{ height: '160px', alignItems: 'flex-end', display: 'flex' }}>
                    <div className="w-full max-w-[40px] bg-navy group-hover:bg-gold transition-colors duration-300 rounded-t-sm" style={{ height: pct + '%' }} />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-display font-bold text-navy text-lg mb-6">Property Status</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                {forSale > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeDasharray={arc(forSale)} strokeDashoffset={offsetSale} />}
                {forRent > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#d4af37" strokeWidth="3.5" strokeDasharray={arc(forRent)} strokeDashoffset={offsetRent} />}
                {other  > 0 && <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#9ca3af" strokeWidth="3.5" strokeDasharray={arc(other)}   strokeDashoffset={offsetOther} />}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold text-navy">{totalProperties}</span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
            <div className="w-full mt-6 space-y-3">
              {[{ label: 'For Sale', value: forSale, color: 'bg-navy' }, { label: 'For Rent', value: forRent, color: 'bg-gold' }, { label: 'Other', value: other, color: 'bg-gray-400' }].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-navy">{item.value}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round((item.value / tot) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties bar chart */}
      <div className="bg-white border border-gray-100 shadow-sm p-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-navy text-lg">Properties Added — Last 6 Months</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" /> Properties
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {months.map((m, i) => {
            const pct = Math.max((m.properties / maxProps) * 100, 3);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-semibold text-navy opacity-0 group-hover:opacity-100 transition-opacity">{m.properties}</span>
                <div className="w-full flex justify-center" style={{ height: '120px', alignItems: 'flex-end', display: 'flex' }}>
                  <div className="w-full max-w-[40px] bg-gray-200 group-hover:bg-navy transition-colors duration-300 rounded-t-sm" style={{ height: pct + '%' }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2 — SITE TRAFFIC
      ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Site Traffic</p>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">Tracked automatically — admin pages excluded</span>
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="bg-indigo-50 p-2 inline-block mb-3">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <p className="text-4xl font-display font-bold text-navy">{totalPageViews}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Total Page Views</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="bg-purple-50 p-2 inline-block mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <p className="text-4xl font-display font-bold text-navy">{uniqueSessions}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Unique Sessions</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="bg-emerald-50 p-2 inline-block mb-3">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <p className="text-4xl font-display font-bold text-navy">{todayViews}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Views Today</p>
          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <div className="bg-amber-50 p-2 inline-block mb-3">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
          </div>
          <p className="text-4xl font-display font-bold text-navy">
            {uniqueSessions > 0 ? (totalPageViews / uniqueSessions).toFixed(1) : '0.0'}
          </p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Pages / Session</p>
          <p className="text-xs text-gray-400 mt-1">Engagement depth</p>
        </div>
      </div>

      {/* Traffic Line Chart + Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Line Chart — 7-day traffic */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-navy text-lg">Daily Traffic — Last 7 Days</h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-8 h-0.5 bg-navy inline-block rounded" /> Views
              </span>
            </div>
          </div>

          {totalPageViews === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-3 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
              <p className="text-sm font-medium">No traffic data yet</p>
              <p className="text-xs mt-1">Views will appear here as visitors browse your site</p>
            </div>
          ) : (
            <div className="relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-300 pr-2" style={{ width: '28px' }}>
                <span>{maxViews}</span>
                <span>{Math.round(maxViews / 2)}</span>
                <span>0</span>
              </div>
              {/* Chart area */}
              <div className="ml-8">
                <svg viewBox={`0 0 300 80`} className="w-full h-40 overflow-visible">
                  {/* Horizontal grid lines */}
                  {[0, 40, 80].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`0,80 ${pts} 300,80`}
                    fill="url(#trafficGrad)"
                  />
                  {/* Line */}
                  <polyline
                    points={pts}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Dots */}
                  {dailyData.map((d, i) => {
                    const x = (i / Math.max(dailyData.length - 1, 1)) * 300;
                    const y = 80 - Math.max((d.views / maxViews) * 80, 2);
                    return (
                      <circle key={i} cx={x} cy={y} r="3" fill="#d4af37" stroke="#0f172a" strokeWidth="1.5" />
                    );
                  })}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between mt-1">
                  {dailyData.map((d, i) => (
                    <span key={i} className="text-xs text-gray-400">{d.label}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="font-display font-bold text-navy text-lg mb-6">Top Pages — 30 Days</h2>
          {topPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <p>No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topPages.map(({ path, count }, i) => {
                const maxCount = topPages[0].count;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={path}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-700 truncate flex-1 mr-2 font-medium" title={path}>
                        {path === '/' ? 'Home' : path.replace(/^\//, '').replace(/\//g, ' / ')}
                      </span>
                      <span className="text-navy font-bold flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: pct + '%',
                          background: i === 0 ? '#0f172a' : i === 1 ? '#d4af37' : '#9ca3af'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
