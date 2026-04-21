import PropertyForm from '@/components/admin/PropertyForm';
import AdminShell from '../../AdminShell';

export const metadata = { title: 'Add Property' };

export default function NewPropertyPage() {
  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Add Property</h1>
          <p className="text-gray-500 mt-1">Create a new property listing</p>
        </div>
        <PropertyForm />
      </div>
    </AdminShell>
  );
}
