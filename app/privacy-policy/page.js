import AnimatedSection from '@/components/AnimatedSection';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read the BYD Properties Privacy Policy to understand how we collect, use, and protect your personal information.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.bydproperties.rw/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
      <AnimatedSection>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">Legal</p>
        <h1 className="font-display text-5xl font-bold text-navy mb-8">Privacy Policy</h1>
        <span className="block w-12 h-0.5 bg-gold mb-12" />

        <div className="prose prose-lg text-gray-500 max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">1. Information We Collect</h2>
          <p>
            At BYD Properties, we collect information that you provide directly to us when you use our website,
            such as when you fill out a contact form, subscribe to our newsletter, or request property details.
            This information may include your name, email address, phone number, and any other details you choose to provide.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services. Specifically, we may use your information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Respond to your inquiries and fulfill your requests for property information.</li>
            <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
            <li>Communicate with you about products, services, offers, and events offered by BYD Properties.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our website.</li>
          </ul>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except as described in this Privacy Policy.
            We may share your information with service providers who perform services on our behalf, or when required by law.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">4. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access,
            disclosure, alteration, and destruction.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <strong>privacy@bydproperties.com</strong>.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
