import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Download } from "lucide-react";
import ProgressBar, { type Step } from "./ProgressBar";
import SiteTypeSelector from "./SiteTypeSelector";
import SitemapBuilder, { type Page } from "./SitemapBuilder";
import DesignStyleSelector, { type DesignPreferences } from "./DesignStyleSelector";
import CreativeBriefReview, { type CreativeBriefData } from "./CreativeBriefReview";
import FileUpload from "./FileUpload";

interface OnboardingWizardProps {
  className?: string;
}

const steps: Step[] = [
  { id: 1, title: "Welcome", completed: false },
  { id: 2, title: "Business", completed: false },
  { id: 3, title: "Branding", completed: false },
  { id: 4, title: "Purpose", completed: false },
  { id: 5, title: "Sitemap", completed: false },
  { id: 6, title: "Copy", completed: false },
  { id: 7, title: "Media", completed: false },
  { id: 8, title: "Design", completed: false },
  { id: 9, title: "Review", completed: false },
];

const initialPages: Page[] = [
  { id: '1', name: 'Home', path: '/', required: true },
  { id: '4', name: 'Contact', path: '/contact', required: true }
];

const suggestedPages: Page[] = [
  { id: 'about', name: 'About', path: '/about', required: false },
  { id: 'services', name: 'Services', path: '/services', required: false },
  { id: 'portfolio', name: 'Portfolio', path: '/portfolio', required: false },
  { id: 'testimonials', name: 'Testimonials', path: '/testimonials', required: false },
  { id: 'blog', name: 'Blog', path: '/blog', required: false },
  { id: 'faq', name: 'FAQ', path: '/faq', required: false },
  { id: 'team', name: 'Team', path: '/team', required: false },
  { id: 'pricing', name: 'Pricing', path: '/pricing', required: false }
];

export default function OnboardingWizard({ className = "" }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Form data state
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedSiteType, setSelectedSiteType] = useState<string>("");
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [designPreferences, setDesignPreferences] = useState<DesignPreferences>({
    selectedStyle: "",
    inspirationLinks: [],
    additionalNotes: ""
  });

  const stepData = steps.map(step => ({
    ...step,
    completed: completedSteps.has(step.id)
  }));

  const isStepComplete = (stepId: number): boolean => {
    switch (stepId) {
      case 1: return true; // Welcome step is always complete
      case 2: return businessName.trim() !== "" && businessDescription.trim() !== "";
      case 3: return logoFile !== null;
      case 4: return selectedSiteType !== "";
      case 5: return pages.length >= 2;
      case 6: return true; // Copy step - assume AI generated
      case 7: return true; // Media step - optional
      case 8: return designPreferences.selectedStyle !== "";
      case 9: return true; // Review step
      default: return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const nextStep = () => {
    if (canProceed && currentStep < steps.length) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
      setCurrentStep(prev => prev + 1);
      console.log('Proceeding to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      console.log('Going back to step:', currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    if (stepId <= currentStep || completedSteps.has(stepId - 1)) {
      setCurrentStep(stepId);
      console.log('Jumping to step:', stepId);
    }
  };

  const generateContent = () => {
    console.log('Generating AI content for pages...');
    // TODO: Implement AI content generation
  };

  const exportPDF = () => {
    console.log('Exporting creative brief as PDF...');
    // TODO: Implement PDF export
  };

  const submitProject = () => {
    console.log('Submitting project...');
    // TODO: Implement project submission
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardContent className="pt-8 text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Welcome to Our Onboarding Portal</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                We'll guide you through a comprehensive questionnaire to create the perfect creative brief for your website project. This process takes about 15-20 minutes and ensures we understand exactly what you need.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Business Identity</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your business and brand</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Website Strategy</h3>
                  <p className="text-sm text-muted-foreground">Define your website's purpose and structure</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Design Direction</h3>
                  <p className="text-sm text-muted-foreground">Share your visual preferences and style</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tell Us About Your Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Design Studio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  data-testid="input-business-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Business Description *</label>
                <textarea
                  placeholder="Describe what your business does, who you serve, and what makes you unique..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border rounded-md"
                  data-testid="textarea-business-description"
                />
              </div>
              {businessName && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    <strong>AI Suggestion:</strong> Based on "{businessName}", we suggest focusing on professional credibility and clear service communication.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FileUpload
                  onFileSelect={setLogoFile}
                  onFileRemove={() => setLogoFile(null)}
                  currentFile={logoFile}
                  acceptedTypes="image/*"
                  maxSize={10}
                  placeholder="Upload your logo or brand assets"
                />
                {logoFile && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm">
                      <strong>AI Analysis:</strong> We'll analyze your logo to suggest complementary colors and design elements for your website.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Website Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteTypeSelector 
                selectedType={selectedSiteType}
                onTypeSelect={setSelectedSiteType}
              />
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Site Map Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <SitemapBuilder
                pages={pages}
                onPagesUpdate={setPages}
                suggestedPages={suggestedPages}
              />
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content & Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Our AI will generate draft copy for each of your pages based on your business information and selected website type.
                </p>
                <Button onClick={generateContent} className="gap-2" data-testid="button-generate-content">
                  <Sparkles className="w-4 h-4" />
                  Generate Page Content
                </Button>
              </div>
              
              <div className="grid gap-4">
                {pages.slice(0, 3).map((page) => (
                  <div key={page.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{page.name} Page</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-generated content will appear here for the {page.name.toLowerCase()} page...
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Images & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Upload images for your website or let us know what type of images you need.
              </p>
              <FileUpload
                onFileSelect={(file) => console.log('Media file uploaded:', file.name)}
                onFileRemove={() => console.log('Media file removed')}
                acceptedTypes="image/*,video/*"
                maxSize={50}
                placeholder="Upload images, videos, or other media files"
              />
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Design Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <DesignStyleSelector
                preferences={designPreferences}
                onPreferencesUpdate={setDesignPreferences}
              />
            </CardContent>
          </Card>
        );

      case 9:
        const briefData: CreativeBriefData = {
          businessName,
          businessDescription,
          logoFile: logoFile || undefined,
          colors: ['#3B82F6', '#10B981'], // Mock colors
          fonts: ['Inter', 'Open Sans'], // Mock fonts
          siteType: selectedSiteType,
          pages: pages.map(p => ({ name: p.name, path: p.path })),
          pageContent: {
            'Home': 'Welcome to ' + businessName + '. ' + businessDescription,
            'About': 'Learn more about our story and what drives us.',
            'Contact': 'Get in touch with us today.'
          },
          images: [], // Mock images
          designStyle: designPreferences.selectedStyle || '',
          inspirationLinks: designPreferences.inspirationLinks,
          designNotes: designPreferences.additionalNotes
        };

        return (
          <CreativeBriefReview
            briefData={briefData}
            onExportPDF={exportPDF}
            onEditSection={(section) => console.log('Edit section:', section)}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };

  if (currentStep === 10) {
    // Thank you / completion page
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your creative brief has been submitted successfully. Our team will review it and reach out to schedule your kickoff call within 24 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={exportPDF} variant="outline" data-testid="button-final-export">
                <Download className="w-4 h-4 mr-2" />
                Download Brief
              </Button>
              <Button onClick={() => console.log('View dashboard')} data-testid="button-view-dashboard">
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} steps={stepData} />
      </div>
      
      <div className="mb-8">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
          data-testid="button-previous"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {currentStep === 9 ? (
            <span>Ready to submit your creative brief</span>
          ) : (
            <span>
              {canProceed ? "Ready to continue" : "Please complete this step to continue"}
            </span>
          )}
        </div>
        
        {currentStep === 9 ? (
          <Button
            onClick={submitProject}
            disabled={!canProceed}
            className="gap-2"
            data-testid="button-submit-project"
          >
            Submit Project
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!canProceed}
            className="gap-2"
            data-testid="button-next"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}