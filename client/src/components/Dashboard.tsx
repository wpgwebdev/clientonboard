import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

export interface Project {
  id: string;
  name: string;
  status: 'draft' | 'in_review' | 'approved' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  type: string;
  progress: number;
}

interface DashboardProps {
  projects: Project[];
  userRole: 'client' | 'admin';
  onCreateProject: () => void;
  onViewProject: (id: string) => void;
  onEditProject: (id: string) => void;
  onExportProject: (id: string) => void;
  className?: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-yellow-500', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle }
};

export default function Dashboard({ 
  projects, 
  userRole, 
  onCreateProject,
  onViewProject,
  onEditProject,
  onExportProject,
  className = "" 
}: DashboardProps) {
  const getStatusInfo = (status: Project['status']) => {
    return statusConfig[status] || statusConfig.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === 'admin' ? 'Admin Dashboard' : 'My Projects'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'admin' 
              ? 'Manage all client projects and creative briefs'
              : 'Track your website projects and creative briefs'
            }
          </p>
        </div>
        {userRole === 'client' && (
          <Button onClick={onCreateProject} className="gap-2" data-testid="button-create-project">
            <Plus className="w-4 h-4" />
            Start New Project
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_review').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No projects yet</p>
              <p className="text-muted-foreground mb-4">
                {userRole === 'client' 
                  ? "Start your first website project by creating a creative brief"
                  : "No client projects have been submitted yet"
                }
              </p>
              {userRole === 'client' && (
                <Button onClick={onCreateProject} data-testid="button-create-first-project">
                  Create Your First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const statusInfo = getStatusInfo(project.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <StatusIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold truncate">{project.name}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Type: {project.type}</span>
                          <span>Created: {formatDate(project.createdAt)}</span>
                          <span>Updated: {formatDate(project.updatedAt)}</span>
                          {project.progress > 0 && (
                            <span>Progress: {project.progress}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewProject(project.id)}
                        data-testid={`button-view-project-${project.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {(userRole === 'client' && project.status === 'draft') || userRole === 'admin' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEditProject(project.id)}
                          data-testid={`button-edit-project-${project.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      ) : null}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onExportProject(project.id)}
                        data-testid={`button-export-project-${project.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}