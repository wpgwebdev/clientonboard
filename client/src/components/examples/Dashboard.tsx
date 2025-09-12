import { useState } from 'react';
import Dashboard, { type Project } from '../Dashboard';

export default function DashboardExample() {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Acme Design Studio Website',
      status: 'in_progress',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      type: 'Service Business',
      progress: 65
    },
    {
      id: '2',
      name: 'Local Bakery Online Store',
      status: 'completed',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T16:00:00Z',
      type: 'E-commerce',
      progress: 100
    },
    {
      id: '3',
      name: 'Tech Startup Blog',
      status: 'in_review',
      createdAt: '2024-01-20T11:00:00Z',
      updatedAt: '2024-01-22T10:00:00Z',
      type: 'Blog/Content',
      progress: 45
    }
  ]);
  
  const handleCreateProject = () => {
    console.log('Creating new project...');
  };
  
  const handleViewProject = (id: string) => {
    console.log('Viewing project:', id);
  };
  
  const handleEditProject = (id: string) => {
    console.log('Editing project:', id);
  };
  
  const handleExportProject = (id: string) => {
    console.log('Exporting project:', id);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Dashboard
        projects={projects}
        userRole="client"
        onCreateProject={handleCreateProject}
        onViewProject={handleViewProject}
        onEditProject={handleEditProject}
        onExportProject={handleExportProject}
      />
    </div>
  );
}