import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewAgentPropertyPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/agent/properties" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-navy transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to properties
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Submit New Property</h1>
        <p className="text-gray-500 mt-2">
          Add a new property to your portfolio. It will be reviewed by the admin team before going live.
        </p>
      </div>

      <PropertyForm isAgent={true} returnUrl="/agent/properties" />
    </div>
  );
}
