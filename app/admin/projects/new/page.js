import PropertyForm from '@/components/admin/PropertyForm';
import AdminShell from '../../AdminShell';
import { HardHat } from 'lucide-react';

export const metadata = { title: 'Add Construction Project' };

export default function NewProjectPage() {
  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-orange-500 flex items-center justify-center flex-shrink-0">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">Add Construction Project</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            This listing will appear on the public <strong>/projects</strong> page automatically.
          </p>
        </div>
        {/* Pre-set status to under-construction */}
        <PropertyForm initialValues={{ status: 'under-construction' }} />
      </div>
    </AdminShell>
  );
}
