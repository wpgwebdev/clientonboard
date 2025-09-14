import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Download, Upload, Palette, Check, Wand2, Loader2 } from "lucide-react";
import ProgressBar, { type Step } from "./ProgressBar";
import SiteTypeSelector from "./SiteTypeSelector";
import SitemapBuilder, { type Page } from "./SitemapBuilder";
import DesignStyleSelector, { type DesignPreferences } from "./DesignStyleSelector";
import CreativeBriefReview, { type CreativeBriefData } from "./CreativeBriefReview";
import FileUpload from "./FileUpload";
import { 
  type LogoPreferences, 
  type GeneratedLogo, 
  type LogoSelection, 
  logoPreferencesSchema,
  type ContentPreferences,
  contentPreferencesSchema,
  type GeneratedContent
} from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

const logoTypes = [
  "wordmark", "lettermark", "pictorial", "abstract", "mascot", "combination", "emblem"
];

const logoStyles = [
  "modern", "classic", "minimalist", "vintage", "playful", "elegant", "bold", "organic", 
  "geometric", "hand-drawn", "tech", "luxury"
];

interface LogoGenerationFormProps {
  businessName: string;
  businessDescription: string;
  onLogoGenerated: (logos: GeneratedLogo[]) => void;
  onCancel: () => void;
  generatedLogos: GeneratedLogo[];
  selectedLogo: GeneratedLogo | null;
  onLogoSelect: (logo: GeneratedLogo, decision: 'final' | 'direction') => void;
}

function LogoGenerationForm({ businessName, businessDescription, onLogoGenerated, onCancel, generatedLogos, selectedLogo, onLogoSelect }: LogoGenerationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<LogoPreferences>({
    resolver: zodResolver(logoPreferencesSchema),
    defaultValues: {
      types: [],
      styles: [],
      colors: "",
      inspirations: [],
      useReference: false
    }
  });

  const generateLogosMutation = useMutation({
    mutationFn: async (data: LogoPreferences) => {
      const response = await apiRequest('POST', '/api/logo/generate', {
        businessName,
        description: businessDescription,
        preferences: data
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate logos');
      }
      
      return response.json() as Promise<{ logos: GeneratedLogo[]; prompt: string }>;
    },
    onSuccess: (data) => {
      onLogoGenerated(data.logos);
      toast({
        title: "Logos Generated!",
        description: `Created ${data.logos.length} logo variations for your review.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LogoPreferences) => {
    generateLogosMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Generate Logo Ideas</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          data-testid="button-change-logo-path"
        >
          Change Option
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo Types */}
          <FormField
            control={form.control}
            name="types"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Types <span className="text-destructive">*</span></FormLabel>
                <FormDescription>Select at least one logo type that fits your brand</FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {logoTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value?.includes(type as any) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), type]);
                          } else {
                            field.onChange(field.value?.filter((t) => t !== type) || []);
                          }
                        }}
                        data-testid={`checkbox-logo-type-${type}`}
                      />
                      <label className="text-sm capitalize">{type.replace('-', ' ')}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Logo Styles */}
          <FormField
            control={form.control}
            name="styles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Styles <span className="text-destructive">*</span></FormLabel>
                <FormDescription>Select at least one style that matches your vision</FormDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {logoStyles.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value?.includes(style as any) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), style]);
                          } else {
                            field.onChange(field.value?.filter((s) => s !== style) || []);
                          }
                        }}
                        data-testid={`checkbox-logo-style-${style}`}
                      />
                      <label className="text-sm capitalize">{style}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Colors */}
          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Preferences</FormLabel>
                <FormDescription>Describe your preferred colors (e.g., "blue and white", "earth tones", "vibrant")</FormDescription>
                <FormControl>
                  <Input 
                    placeholder="e.g., blue and silver, warm earth tones, monochrome"
                    {...field}
                    data-testid="input-logo-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspirations */}
          <FormField
            control={form.control}
            name="inspirations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Design Inspirations</FormLabel>
                <FormDescription>Optional: Any specific concepts, symbols, or ideas for your logo</FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., mountain peaks, circuit boards, handwritten script, vintage badges..."
                    className="resize-none"
                    rows={3}
                    value={field.value?.join(', ') || ''}
                    onChange={(e) => {
                      const inspirations = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                      field.onChange(inspirations);
                    }}
                    data-testid="input-logo-inspirations"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={generateLogosMutation.isPending}
              data-testid="button-generate-logos"
            >
              {generateLogosMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Logos
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-generation"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {/* Logo Gallery */}
      {generatedLogos.length > 0 && (
        <div className="space-y-4 mt-8 pt-6 border-t" data-testid="container-generated-logos">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Generated Logo Ideas</h3>
            <Badge variant="secondary">{generatedLogos.length} Options</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Select a logo that you'd like to use as your final design or as creative direction.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {generatedLogos.map((logo) => (
              <Card 
                key={logo.id} 
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedLogo?.id === logo.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                data-testid={`card-logo-option-${logo.id}`}
              >
                <CardContent className="p-3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3">
                    <img 
                      src={logo.dataUrl} 
                      alt="Generated logo option"
                      className="w-full h-full object-contain"
                      data-testid={`image-logo-${logo.id}`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onLogoSelect(logo, 'final')}
                        className="flex-1"
                        data-testid={`button-select-final-${logo.id}`}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Use This
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLogoSelect(logo, 'direction')}
                        className="flex-1"
                        data-testid={`button-select-direction-${logo.id}`}
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Direction
                      </Button>
                    </div>
                    {selectedLogo?.id === logo.id && (
                      <div className="text-xs text-center text-primary font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Clear current results to allow new generation
                onLogoGenerated([]);
              }}
              data-testid="button-generate-more-logos"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate More Ideas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingWizard({ className = "" }: OnboardingWizardProps) {
  const { toast } = useToast();
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
  
  // Content generation state
  const [contentPreferences, setContentPreferences] = useState<ContentPreferences>({
    style: 'balanced',
    useVideo: false,
    tone: 'professional'
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  
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

  const generateContent = async () => {
    if (isGeneratingContent) return;
    
    setIsGeneratingContent(true);
    console.log('Generating AI content for pages...');
    
    try {
      const response = await apiRequest('POST', '/api/content/generate', {
        businessName,
        businessDescription,
        siteType: selectedSiteType,
        pages: pages.map(p => ({ id: p.id, name: p.name, path: p.path })),
        preferences: contentPreferences
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate content');
      }
      
      const data = await response.json() as { content: GeneratedContent[] };
      setGeneratedContent(data.content);
      
      toast({
        title: "Content Generated!",
        description: `Created content for ${data.content.length} pages.`
      });
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
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

                {/* Generate Path */}
                {logoPath === 'generate' && (
                  <LogoGenerationForm
                    businessName={businessName}
                    businessDescription={businessDescription}
                    onLogoGenerated={(logos) => {
                      setGeneratedLogos(logos);
                    }}
                    onCancel={() => setLogoPath(null)}
                    generatedLogos={generatedLogos}
                    selectedLogo={selectedLogo}
                    onLogoSelect={(logo, decision) => {
                      setSelectedLogo(logo);
                      setLogoDecision(decision);
                    }}
                  />
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
              </div>

              {/* Content Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Content Style */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Style</label>
                      <Select 
                        value={contentPreferences.style} 
                        onValueChange={(value: 'text-heavy' | 'visual-focused' | 'balanced') => 
                          setContentPreferences(prev => ({ ...prev, style: value }))
                        }
                      >
                        <SelectTrigger data-testid="select-content-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-heavy">Text Heavy</SelectItem>
                          <SelectItem value="visual-focused">Visual Focused</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tone</label>
                      <Select 
                        value={contentPreferences.tone} 
                        onValueChange={(value: 'professional' | 'casual' | 'friendly' | 'authoritative') => 
                          setContentPreferences(prev => ({ ...prev, tone: value }))
                        }
                      >
                        <SelectTrigger data-testid="select-content-tone">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Video Usage */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="use-video"
                        checked={contentPreferences.useVideo}
                        onCheckedChange={(checked) => 
                          setContentPreferences(prev => ({ ...prev, useVideo: !!checked }))
                        }
                        data-testid="checkbox-use-video"
                      />
                      <div>
                        <label htmlFor="use-video" className="text-sm font-medium">
                          Video Content
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Interested in using video content (you'll create videos yourself)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="text-center">
                <Button 
                  onClick={generateContent} 
                  disabled={isGeneratingContent}
                  className="gap-2" 
                  data-testid="button-generate-content"
                >
                  {isGeneratingContent ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Page Content
                    </>
                  )}
                </Button>
              </div>
              
              {/* Generated Content Display */}
              <div className="grid gap-4">
                {pages.map((page) => {
                  const pageContent = generatedContent.find(content => content.pageId === page.id);
                  return (
                    <div key={page.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{page.name} Page</h4>
                      {pageContent ? (
                        <div className="space-y-3">
                          <div className="bg-muted p-3 rounded text-sm">
                            {pageContent.content}
                          </div>
                          {pageContent.suggestions && pageContent.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {pageContent.suggestions.map((suggestion, index) => (
                                  <li key={index}>• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          AI-generated content will appear here for the {page.name.toLowerCase()} page...
                        </p>
                      )}
                    </div>
                  );
                })}
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
          logoDecision: logoDecision || undefined,
          selectedLogo: selectedLogo || undefined,
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