import AnimatedSection from '@/components/AnimatedSection';
import Link from 'next/link';
import Image from 'next/image';
import { getContent } from '@/lib/db';

export const revalidate = 60;

export const metadata = {
  title: 'About Us',
  description:
    'Learn about BYD Properties — Rwanda\'s trusted real estate and construction company since 2010. 350+ projects, 1,200+ happy clients, and a team committed to excellence.',
  openGraph: {
    title: 'About BYD Properties | Rwanda Real Estate & Construction',
    description: 'Over 14 years of building Rwanda\'s premium real estate landscape. Meet the team behind BYD Properties.',
    images: [{ url: '/logo-transparent.png', alt: 'About BYD Properties' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://www.bydproperties.rw/about' },
};

const defaultTeam = [
  { name: 'Khaled Youssef', role: 'CEO & Founder', initials: 'KY' },
  { name: 'Nour El-Din Hassan', role: 'Chief Architect', initials: 'NH' },
  { name: 'Dina Ramadan', role: 'Head of Sales', initials: 'DR' },
  { name: 'Omar Gamal', role: 'Construction Director', initials: 'OG' },
];

const defaultValues = [
  { title: 'Integrity', desc: 'We operate with complete transparency in every transaction and project.' },
  { title: 'Excellence', desc: 'We hold ourselves to the highest standards of quality in everything we do.' },
  { title: 'Innovation', desc: 'We embrace modern techniques and technologies to deliver superior results.' },
  { title: 'Partnership', desc: 'We build lasting relationships with our clients, treating their goals as our own.' },
];

export default async function AboutPage() {
  const content = await getContent();
  const about = content?.about || {};
  
  const displayTeam = about.team && about.team.length > 0 ? about.team : defaultTeam;
  const displayValues = about.values && about.values.length > 0 ? about.values : defaultValues;
  const displayStats = about.stats && about.stats.length > 0 ? about.stats : [
    { num: '14+', label: 'Years' },
    { num: '350+', label: 'Projects' },
    { num: '1,200+', label: 'Clients' },
    { num: '28', label: 'Awards' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">
              Who We Are
            </p>
            <h1 className="font-display text-5xl font-bold text-white mb-4">
              {about.title || 'About BYD Properties'}
            </h1>
            <span className="block w-12 h-0.5 bg-gold" />
            <p className="text-white/55 mt-6 max-w-xl">
              {about.subtitle || 'A legacy of trust, quality, and innovation in Rwandan real estate.'}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="right">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">Our Story</p>
            <h2 className="section-title mb-4">From vision to legacy</h2>
            <span className="gold-line" />
            {(about.story || 
              "Founded in 2010, BYD Properties has grown from a boutique construction firm to one of Rwanda's most respected real estate companies. We combine decades of engineering expertise with a passion for design to deliver spaces that inspire.\n\nToday, our portfolio spans residential developments, commercial towers, and exclusive property sales — all underpinned by the same founding commitment: to build with integrity and deliver with pride."
            ).split('\n').filter(p => p.trim()).map((para, idx) => (
              <p key={idx} className="text-gray-500 leading-relaxed mb-6 last:mb-0">
                {para}
              </p>
            ))}
          </AnimatedSection>

          <AnimatedSection direction="left" delay={0.15}>
            <div className="grid grid-cols-2 gap-4">
              {displayStats.map((s) => (
                <div key={s.label} className="bg-cream p-8 text-center">
                  <div className="font-display text-4xl font-bold text-gold mb-2">{s.num}</div>
                  <div className="text-navy text-sm font-semibold uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <AnimatedSection>
            <div className="border-l-2 border-gold pl-8">
              <h3 className="font-display text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-white/60 leading-relaxed">
                {about.mission ||
                  'Our mission is to provide every client with an exceptional experience — from concept to keys — with transparency, quality, and unmatched service.'}
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="border-l-2 border-gold/40 pl-8">
              <h3 className="font-display text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-white/60 leading-relaxed">
                {about.vision ||
                  'To be the leading real estate and construction company in East Africa, recognized for our commitment to quality and client satisfaction.'}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">Our Principles</p>
            <h2 className="section-title">Core Values</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayValues.map((v, i) => (
              <AnimatedSection key={v.title || i} delay={i * 0.1}>
                <div className="bg-white p-8 h-full border-t-2 border-gold">
                  <h3 className="font-display text-xl font-bold text-navy mb-4">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">The People</p>
            <h2 className="section-title">Meet Our Team</h2>
            <p className="text-gray-400 mt-4 text-sm">Hover over a card to learn more</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayTeam.map((member, i) => (
              <AnimatedSection key={member.name || i} delay={i * 0.1}>
                <div className="team-flip-card">
                  <div className="team-flip-inner">
                    {/* Front */}
                    <div className="team-flip-front bg-cream flex flex-col items-center justify-center p-6 text-center shadow-sm border border-gray-100">
                      <div className="w-24 h-24 bg-navy rounded-full flex items-center justify-center mb-4 text-gold font-display font-bold text-2xl overflow-hidden relative ring-4 ring-gold/20">
                        {member.image ? (
                          <Image src={member.image} alt={member.name} fill sizes="96px" className="object-cover" />
                        ) : (
                          member.initials
                        )}
                      </div>
                      <h4 className="font-display font-bold text-navy text-base">{member.name}</h4>
                      <p className="text-gold text-xs font-semibold uppercase tracking-wider mt-1">{member.role}</p>
                      {member.bio && (
                        <span className="mt-3 text-[10px] text-gray-400 uppercase tracking-widest animate-pulse">
                          Hover to read bio
                        </span>
                      )}
                    </div>
                    {/* Back */}
                    <div className="team-flip-back bg-navy flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4 text-gold font-display font-bold text-lg">
                        {member.initials}
                      </div>
                      <h4 className="font-display font-bold text-white text-sm mb-1">{member.name}</h4>
                      <p className="text-gold text-[10px] font-semibold uppercase tracking-wider mb-4">{member.role}</p>
                      <p className="text-white/70 text-xs leading-relaxed">
                        {member.bio || 'Bio coming soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gold">
        <AnimatedSection className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl font-bold text-navy mb-4">
            Let&apos;s build something great together.
          </h2>
          <p className="text-navy/70 mb-10">
            Reach out to our team and start the conversation today.
          </p>
          <Link href="/contact" className="btn-navy">
            Contact Us
          </Link>
        </AnimatedSection>
      </section>
    </div>
  );
}
