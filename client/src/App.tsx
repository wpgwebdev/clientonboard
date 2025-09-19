import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import components
import LandingPage from "@/components/LandingPage";
import OnboardingWizard from "@/components/OnboardingWizard";
import Dashboard from "@/components/Dashboard";
import FeatureSelection from "@/components/FeatureSelection";
import ThemeToggle from "@/components/ThemeToggle";
import type { Project } from "@/components/Dashboard";

// Mock user state for prototype
type UserRole = 'guest' | 'client' | 'admin';

function Router() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding' | 'dashboard' | 'features'>('landing');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const { toast } = useToast();
  
  // Mock projects data
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
    }
  ]);

  const handleGetStarted = () => {
    setCurrentView('onboarding');
    setUserRole('client');
    console.log('Starting onboarding process...');
  };

  const handleLogin = () => {
    setCurrentView('dashboard');
    setUserRole('client');
    console.log('Logging in as client...');
  };

  const handleCreateProject = () => {
    setCurrentView('onboarding');
    console.log('Creating new project...');
  };

  const handleViewProject = (id: string) => {
    console.log('Viewing project:', id);
  };

  const handleEditProject = (id: string) => {
    setCurrentView('onboarding');
    console.log('Editing project:', id);
  };

  const handleExportProject = (id: string) => {
    console.log('Exporting project:', id);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={handleGetStarted}
            onLogin={handleLogin}
          />
        );
      
      case 'onboarding':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b p-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                    data-testid="button-back-to-dashboard"
                  >
                    ← Back to Dashboard
                  </button>
                  <h1 className="text-lg font-semibold">Client Onboarding Portal</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <div className="p-6">
              <OnboardingWizard />
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCurrentView('landing')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                    data-testid="button-back-to-landing"
                  >
                    ← Back to Landing
                  </button>
                  <h1 className="text-lg font-semibold">WebStudio Pro</h1>
                  <button
                    onClick={() => setCurrentView('features')}
                    className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded hover-elevate"
                    data-testid="button-go-to-features"
                  >
                    Feature Selection
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setUserRole('client')}
                      className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                      data-testid="button-switch-to-client"
                    >
                      Switch to Client View
                    </button>
                  )}
                  {userRole === 'client' && (
                    <button
                      onClick={() => setUserRole('admin')}
                      className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                      data-testid="button-switch-to-admin"
                    >
                      Switch to Admin View
                    </button>
                  )}
                </div>
                <ThemeToggle />
              </div>
            </header>
            <div className="max-w-7xl mx-auto p-6">
              <Dashboard
                projects={projects}
                userRole={userRole as 'client' | 'admin'}
                onCreateProject={handleCreateProject}
                onViewProject={handleViewProject}
                onEditProject={handleEditProject}
                onExportProject={handleExportProject}
              />
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                    data-testid="button-back-to-dashboard-from-features"
                  >
                    ← Back to Dashboard
                  </button>
                  <h1 className="text-lg font-semibold">WebStudio Pro - Feature Selection</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <div className="max-w-4xl mx-auto p-6">
              <FeatureSelection
                userId="mock-user-id"
                onSaved={() => {
                  toast({
                    title: "Features Saved",
                    description: "Your feature selection has been saved successfully."
                  });
                }}
              />
            </div>
          </div>
        );
      
      default:
        return <NotFound />;
    }
  };

  return (
    <Switch>
      <Route path="/" component={() => renderCurrentView()} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
