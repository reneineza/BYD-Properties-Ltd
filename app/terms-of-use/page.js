import AnimatedSection from '@/components/AnimatedSection';

export const metadata = {
  title: 'Terms of Use',
  description: 'Read the BYD Properties Terms of Use governing use of our website and real estate services in Rwanda.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.bydproperties.rw/terms-of-use' },
};

export default function TermsOfUsePage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
      <AnimatedSection>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-3">Legal</p>
        <h1 className="font-display text-5xl font-bold text-navy mb-8">Terms of Use</h1>
        <span className="block w-12 h-0.5 bg-gold mb-12" />

        <div className="prose prose-lg text-gray-500 max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the BYD Properties website, you accept and agree to be bound by the terms and provision of this agreement.
            In addition, when using this website&apos;s particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">2. Intellectual Property Rights</h2>
          <p>
            The website and its original content, features, and functionality are owned by BYD Properties and are protected by international copyright,
            trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">3. Property Information</h2>
          <p>
            All information provided regarding properties for sale or rent, or any other services, is from sources deemed reliable.
            However, no representation is made as to the accuracy thereof, and such information is subject to errors, omissions, change of price,
            rental, commission, prior sale, lease or financing, or withdrawal without notice.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            In no event shall BYD Properties, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for damages, direct or consequential,
            resulting from your use of the site, and you agree to defend, indemnify and hold us harmless from any claims, losses, liability costs and expenses.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">5. Modifications</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide
            at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2 className="text-navy font-bold text-2xl mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <strong>legal@bydproperties.rw</strong>.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
