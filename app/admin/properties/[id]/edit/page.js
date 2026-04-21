import { getPropertyById } from '@/lib/db';
import { notFound } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';
import AdminShell from '../../../AdminShell';

export const metadata = { title: 'Edit Property' };

export default async function EditPropertyPage({ params }) {
  const property = await getPropertyById(params.id);
  if (!property) notFound();

  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Edit Property</h1>
          <p className="text-gray-500 mt-1 truncate">{property.title}</p>
        </div>
        <PropertyForm initialValues={property} propertyId={params.id} />
      </div>
    </AdminShell>
  );
}
