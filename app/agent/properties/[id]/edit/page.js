import { getPropertyById } from '@/lib/db';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditAgentPropertyPage({ params }) {
  const property = await getPropertyById(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/agent/properties" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-navy transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to properties
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Edit Property</h1>
        <p className="text-gray-500 mt-2">
          Update the details of your property. <strong className="text-amber-600">Note: Editing an approved property will reset its status to pending review.</strong>
        </p>
      </div>

      <PropertyForm 
        initialValues={property} 
        propertyId={property.id} 
        isAgent={true} 
        returnUrl="/agent/properties" 
      />
    </div>
  );
}
