import ProjectForm from '@/components/admin/ProjectForm';
import AdminShell from '../../AdminShell';
import { HardHat } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = { title: 'Add Construction Project' };

export default function NewProjectPage() {
  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-navy transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-orange-500 flex items-center justify-center flex-shrink-0">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">Add Construction Project</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            This project will appear on the public <strong>/projects</strong> showcase page.
            No pricing needed — this is for showcasing projects under development.
          </p>
        </div>
        <ProjectForm />
      </div>
    </AdminShell>
  );
}
