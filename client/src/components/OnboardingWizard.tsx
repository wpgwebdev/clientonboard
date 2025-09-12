import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Download, Upload, Palette, Check } from "lucide-react";
import ProgressBar, { type Step } from "./ProgressBar";
import SiteTypeSelector from "./SiteTypeSelector";
import SitemapBuilder, { type Page } from "./SitemapBuilder";
import DesignStyleSelector, { type DesignPreferences } from "./DesignStyleSelector";
import CreativeBriefReview, { type CreativeBriefData } from "./CreativeBriefReview";
import FileUpload from "./FileUpload";
import { type LogoPreferences, type GeneratedLogo, type LogoSelection } from "@shared/schema";

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
  const [hasBusinessName, setHasBusinessName] = useState<boolean | null>(null);
  const [businessNameIdea, setBusinessNameIdea] = useState("");
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Logo generation state
  const [logoPath, setLogoPath] = useState<'upload' | 'generate' | null>(null);
  const [logoPreferences, setLogoPreferences] = useState<LogoPreferences>({
    types: [],
    styles: [],
    colors: "",
    inspirations: [],
    useReference: false
  });
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [isGeneratingLogos, setIsGeneratingLogos] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<GeneratedLogo | null>(null);
  const [logoDecision, setLogoDecision] = useState<'final' | 'direction' | null>(null);
  
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
      case 2: return businessDescription.trim() !== "" && 
                     businessName.trim() !== "" && 
                     hasBusinessName !== null;
      case 3: return (logoPath === 'upload' && logoFile !== null) || 
                     (logoPath === 'generate' && selectedLogo !== null && logoDecision !== null);
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

  const generateBusinessNames = async () => {
    // Need either business description or business name idea
    if (!businessDescription.trim() && !businessNameIdea.trim()) return;
    
    setIsGeneratingNames(true);
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          description: businessDescription.trim() || undefined,
          nameIdea: businessNameIdea.trim() || undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedNames(data.names || []);
      } else {
        console.error('Failed to generate business names');
        // Fallback names based on what input we have
        const baseName = businessNameIdea.trim() || businessDescription.split(' ')[0] || "Business";
        setGeneratedNames([
          `${baseName} Co`,
          `${baseName} Solutions`,
          `${baseName} Studio`,
          `${baseName} Group`,
          `${baseName} Pro`
        ]);
      }
    } catch (error) {
      console.error('Error generating business names:', error);
      // Fallback names
      const baseName = businessNameIdea.trim() || businessDescription.split(' ')[0] || "Business";
      setGeneratedNames([
        `${baseName} Co`,
        `${baseName} Solutions`, 
        `${baseName} Studio`,
        `${baseName} Group`,
        `${baseName} Pro`
      ]);
    } finally {
      setIsGeneratingNames(false);
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
              {/* First: Business Description */}
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

              {/* Second: Ask if they have a business name */}
              {businessDescription.trim() && (
                <div>
                  <label className="text-sm font-medium mb-3 block">Do you have a business name? *</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setHasBusinessName(true);
                        setGeneratedNames([]);
                      }}
                      className={`w-full p-3 text-left border rounded-md hover-elevate ${hasBusinessName === true ? 'border-primary bg-primary/10' : 'border-border'}`}
                      data-testid="button-has-business-name-yes"
                    >
                      <span className="font-medium">Yes, I have a business name</span>
                      <p className="text-sm text-muted-foreground mt-1">I'll enter my existing business name</p>
                    </button>
                    <button
                      onClick={() => {
                        setHasBusinessName(false);
                        setBusinessName("");
                      }}
                      className={`w-full p-3 text-left border rounded-md hover-elevate ${hasBusinessName === false ? 'border-primary bg-primary/10' : 'border-border'}`}
                      data-testid="button-has-business-name-no"
                    >
                      <span className="font-medium">No, I need help creating one</span>
                      <p className="text-sm text-muted-foreground mt-1">Generate suggestions based on my business description</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Third: Business Name Input (if they have one) */}
              {hasBusinessName === true && (
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
              )}

              {/* Fourth: Name Generation (if they don't have one) */}
              {hasBusinessName === false && (
                <div>
                  <label className="text-sm font-medium mb-3 block">Business Name Generation *</label>
                  
                  {/* Business Name Idea Input */}
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Do you have a business name idea? (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 'Creative Edge' or 'Digital Boost' - we'll generate variations"
                      value={businessNameIdea}
                      onChange={(e) => setBusinessNameIdea(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      data-testid="input-business-name-idea"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If you have a rough idea for a name, enter it here and we'll generate creative variations
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">AI-Generated Names</label>
                    <Button
                      onClick={generateBusinessNames}
                      disabled={isGeneratingNames || (!businessDescription.trim() && !businessNameIdea.trim())}
                      size="sm"
                      variant="outline"
                      data-testid="button-generate-names"
                    >
                      {isGeneratingNames ? "Generating..." : "Generate Names"}
                    </Button>
                  </div>
                  
                  {generatedNames.length === 0 && !isGeneratingNames && (
                    <div className="p-4 border rounded-md text-center text-muted-foreground">
                      <div className="space-y-2">
                        <p>Click "Generate Names" to get AI-powered suggestions</p>
                        <p className="text-xs">
                          {businessNameIdea.trim() 
                            ? `Based on your idea "${businessNameIdea}" and business description`
                            : "Based on your business description"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isGeneratingNames && (
                    <div className="p-4 border rounded-md text-center">
                      <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {businessNameIdea.trim() 
                          ? `Generating creative variations of "${businessNameIdea}"...`
                          : "Generating creative names for your business..."
                        }
                      </p>
                    </div>
                  )}
                  
                  {generatedNames.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        {businessNameIdea.trim() 
                          ? `Variations based on "${businessNameIdea}"`
                          : "Names based on your business description"
                        }
                      </div>
                      {generatedNames.map((name, index) => (
                        <button
                          key={index}
                          onClick={() => setBusinessName(name)}
                          className={`w-full p-3 text-left border rounded-md hover-elevate ${businessName === name ? 'border-primary bg-primary/10' : 'border-border'}`}
                          data-testid={`button-select-name-${index}`}
                        >
                          <span className="font-medium">{name}</span>
                        </button>
                      ))}
                      <div className="pt-2">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Or enter a completely different name:</label>
                        <input
                          type="text"
                          placeholder="Enter your preferred business name"
                          value={generatedNames.includes(businessName) ? "" : businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full p-2 text-sm border rounded-md"
                          data-testid="input-custom-business-name"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Suggestion */}
              {businessName && businessDescription && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    <strong>AI Insight:</strong> Based on "{businessName}" and your business description, we suggest focusing on professional credibility and clear service communication in your website design.
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
                {/* Choice Cards - Upload vs Generate */}
                {!logoPath && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card 
                      className="p-4 cursor-pointer border-2 hover-elevate transition-all"
                      onClick={() => setLogoPath('upload')}
                      data-testid="button-logo-path-upload"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Upload className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-medium">I have a logo</h3>
                          <p className="text-sm text-muted-foreground">Upload your existing logo file</p>
                        </div>
                      </div>
                    </Card>
                    <Card 
                      className="p-4 cursor-pointer border-2 hover-elevate transition-all"
                      onClick={() => setLogoPath('generate')}
                      data-testid="button-logo-path-generate"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <Palette className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-medium">I need a logo</h3>
                          <p className="text-sm text-muted-foreground">Generate logo ideas with AI</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Upload Path */}
                {logoPath === 'upload' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Upload Your Logo</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLogoPath(null)}
                        data-testid="button-change-logo-path"
                      >
                        Change Option
                      </Button>
                    </div>
                    <FileUpload
                      onFileSelect={(file) => {
                        setLogoFile(file);
                      }}
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
                )}

                {/* Generate Path - Placeholder for now */}
                {logoPath === 'generate' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Generate Logo Ideas</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLogoPath(null)}
                        data-testid="button-change-logo-path"
                      >
                        Change Option
                      </Button>
                    </div>
                    <div className="p-8 border-2 border-dashed rounded-lg text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/60" />
                      <h3 className="text-lg font-medium mb-2">Logo Generation Coming Soon</h3>
                      <p className="text-muted-foreground mb-4">
                        AI-powered logo generation based on your business description and preferences.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setLogoPath('upload')}
                        data-testid="button-use-upload-instead"
                      >
                        Upload Logo Instead
                      </Button>
                    </div>
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