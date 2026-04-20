import { getPropertyById } from '@/lib/db';
import { notFound } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';

export const metadata = { title: 'Edit Property' };

export default function EditPropertyPage({ params }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy">Edit Property</h1>
        <p className="text-gray-500 mt-1 truncate">{property.title}</p>
      </div>
      <PropertyForm initialValues={property} propertyId={params.id} />
    </div>
  );
}
