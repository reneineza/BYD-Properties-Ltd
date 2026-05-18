import { getPropertyById } from '@/lib/db';
import ProjectForm from '@/components/admin/ProjectForm';
import AdminShell from '../../../AdminShell';
import Link from 'next/link';
import { HardHat, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = { title: 'Edit Construction Project' };

export default async function EditProjectPage({ params }) {
  const project = await getPropertyById(params.id);

  if (!project || project.status !== 'under-construction') {
    notFound();
  }

  return (
    <AdminShell>
      <div>
        <div className="mb-8">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-navy transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-orange-500 flex items-center justify-center flex-shrink-0">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-navy">Edit Project</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-12">
            Update the details of <strong>{project.title}</strong>.
          </p>
        </div>

        <ProjectForm
          initialValues={project}
          projectId={project.id}
        />
      </div>
    </AdminShell>
  );
}
