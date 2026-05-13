export const DEFAULT_CONTENT = {
  home: {
    heroTitle: 'Building Your Vision, Delivering Excellence',
    heroSubtitle: 'BYD Properties — Your trusted partner in premium construction and real estate across Rwanda.',
    heroCtaText: 'Explore Properties',
    statsYears: '14+',
    statsProjects: '30+',
    statsClients: '1,200+',
    statsAwards: '28',
    featuredTitle: 'Featured Properties',
    featuredSubtitle: 'Hand-picked properties from our exclusive portfolio',
  },
  about: {
    title: 'About BYD Properties',
    subtitle: 'A legacy of trust, quality, and innovation in Rwandan real estate.',
    story: 'Founded in 2010, BYD Properties has grown from a boutique construction firm to one of Rwanda\'s most respected real estate companies. We combine decades of engineering expertise with a passion for design to deliver spaces that inspire.\n\nToday, our portfolio spans residential developments, commercial towers, and exclusive property sales — all underpinned by the same founding commitment: to build with integrity and deliver with pride.',
    mission: 'Our mission is to provide every client with an exceptional experience — from concept to keys — with transparency, quality, and unmatched service.',
    vision: 'To be the leading real estate and construction company in East Africa, recognized for our commitment to quality and client satisfaction.',
    stats: [
      { num: '14+', label: 'Years' },
      { num: '350+', label: 'Projects' },
      { num: '1,200+', label: 'Clients' },
      { num: '28', label: 'Awards' },
    ],
    team: [
      { name: 'Khaled Youssef', role: 'CEO & Founder', initials: 'KY', bio: '', image: '' },
      { name: 'Nour El-Din Hassan', role: 'Chief Architect', initials: 'NH', bio: '', image: '' },
      { name: 'Dina Ramadan', role: 'Head of Sales', initials: 'DR', bio: '', image: '' },
      { name: 'Omar Gamal', role: 'Construction Director', initials: 'OG', bio: '', image: '' },
    ],
    values: [
      { title: 'Integrity', desc: 'We operate with complete transparency in every transaction and project.' },
      { title: 'Excellence', desc: 'We hold ourselves to the highest standards of quality in everything we do.' },
      { title: 'Innovation', desc: 'We embrace modern techniques and technologies to deliver superior results.' },
      { title: 'Partnership', desc: 'We build lasting relationships with our clients, treating their goals as our own.' },
    ]
  },
  contact: {
    address: 'Kigali, Rwanda',
    phone: '+250 788 661 932',
    email: 'info@bydproperties.rw',
    workingHours: 'Mon – Fri: 9:00 AM – 6:00 PM',
    whatsapp: '250788661932'
  }
};

// Helper function to deeply merge objects (database data overlaying the default fallback structure)
export function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        // Use source value if it exists and is not null/undefined/empty
        if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
          output[key] = source[key];
        }
      }
    });
  }
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
