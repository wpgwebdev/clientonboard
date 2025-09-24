import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Download, Upload, Palette, Check, Wand2, Loader2, RefreshCw, Plus } from "lucide-react";
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
  type GeneratedContent,
  type ImageRequirements,
  imageRequirementsSchema,
  type CrmIntegration,
  crmIntegrationSchema,
  type UserAccountsMembership,
  userAccountsMembershipSchema
} from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProjectSubmissionRow, InsertProjectSubmission } from "@shared/schema";

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
  { id: 7, title: "Integrations", completed: false },
  { id: 8, title: "User Accounts & Membership", completed: false },
  { id: 9, title: "Media", completed: false },
  { id: 10, title: "Design", completed: false },
  { id: 11, title: "Review", completed: false },
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
  onPreferencesChange: (preferences: LogoPreferences) => void;
}

function LogoGenerationForm({ businessName, businessDescription, onLogoGenerated, onCancel, generatedLogos, selectedLogo, onLogoSelect, onPreferencesChange }: LogoGenerationFormProps) {
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

  // Watch form values and update parent component
  const formValues = form.watch();
  useEffect(() => {
    onPreferencesChange(formValues);
  }, [formValues, onPreferencesChange]);

  const generateLogosMutation = useMutation({
    mutationFn: async (data: LogoPreferences) => {
      console.log('Starting logo generation with AI...');
      
      const response = await apiRequest('POST', '/api/logo/generate', {
        businessName: businessName || undefined,
        description: businessDescription,
        preferences: data
      });
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      onLogoGenerated(data.logos);
      toast({
        title: "Logos Generated!",
        description: `Created ${data.logos.length} logo variations for your review.`
      });
    },
    onError: (error: Error) => {
      console.error('Logo generation failed:', error);
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
              disabled={generateLogosMutation.isPending}
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
  
  // Debug logging for component lifecycle
  useEffect(() => {
    console.log('[DEBUG OnboardingWizard] Component mounted');
    return () => {
      console.log('[DEBUG OnboardingWizard] Component unmounted');
      console.trace('[DEBUG] Unmount stack trace:');
    };
  }, []);
  
  // Debug logging for currentStep changes
  useEffect(() => {
    console.log(`[DEBUG OnboardingWizard] currentStep changed to: ${currentStep}`);
  }, [currentStep]);
  
  // Contact information state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  
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
    preferredFont: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    accentColor: "#60A5FA",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    inspirationLinks: [],
    additionalNotes: ""
  });
  
  // Images & Media state
  const [imageRequirements, setImageRequirements] = useState<ImageRequirements>({
    logoNeeds: 'need-logo',
    logoDescription: '',
    specificImages: [],
    teamPhotos: false,
    productPhotos: false,
    facilityPhotos: false,
    preferredPhotoStyle: 'professional-corporate',
    stockPhotoPreference: 'mixed',
    additionalNotes: ''
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  // CRM Integration state
  const [crmIntegration, setCrmIntegration] = useState<CrmIntegration>({
    selectedCrms: [],
    customCrmNames: [],
    selectedMarketingAutomation: [],
    customMarketingAutomationNames: [],
    selectedPaymentGateways: [],
    customPaymentGatewayNames: [],
    apiIntegrations: '',
    selectedAutomationPlatforms: [],
    selectedEngagementFeatures: [],
    selectedAdvancedFeatures: [],
    selectedECommerceFeatures: []
  });

  // User Accounts & Membership state
  const [userAccountsMembership, setUserAccountsMembership] = useState<UserAccountsMembership>({
    registrationLogin: false,
    userDashboardNeeded: false,
    userDashboardFeatures: '',
    predefinedRoles: [],
    customRoles: [],
    membershipSubscriptionSystem: false,
    membershipDetails: ''
  });

  // Core Website Features state
  const [coreWebsiteFeatures, setCoreWebsiteFeatures] = useState<string[]>([]);

  // Project submission state
  const [isProjectSubmitted, setIsProjectSubmitted] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // CRM form setup
  const crmForm = useForm<CrmIntegration>({
    resolver: zodResolver(crmIntegrationSchema),
    defaultValues: crmIntegration
  });

  const onCrmSubmit = (data: CrmIntegration) => {
    setCrmIntegration(data);
  };

  // Project submission mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProjectSubmission) => {
      const response = await apiRequest('POST', '/api/projects', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }
      return response.json();
    },
    onSuccess: (project: ProjectSubmissionRow) => {
      setCurrentProjectId(project.id);
      console.log('Project created with ID:', project.id);
    },
    onError: (error: Error) => {
      console.error('Failed to create project:', error);
      // Don't show toast for create errors - they're expected during early steps
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProjectSubmission> }) => {
      const response = await apiRequest('PUT', `/api/projects/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('Project updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update project:', error);
      // Don't show toast for update errors - they're expected during partial updates
    }
  });

  // Helper function to build schema-safe project data
  const buildProjectData = (): InsertProjectSubmission | null => {
    // Only create project if we have minimum required data
    if (!businessName?.trim() || !businessDescription?.trim()) {
      return null; // Wait until we have basic business info
    }

    // Build data with proper defaults for required fields
    return {
      userId: undefined, // No authentication required for demo
      fullName: fullName.trim() || undefined,
      email: email.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      businessName: businessName.trim(),
      businessDescription: businessDescription.trim(),
      selectedSiteType: selectedSiteType || "business", // Default site type
      pages: pages.length > 0 ? pages : [{ id: "home", name: "Home", path: "/", required: true }, { id: "contact", name: "Contact", path: "/contact", required: true }],
      logoDecision: logoDecision || undefined,
      logoFile: logoFile ? 'uploaded_file' : undefined,
      selectedLogo: selectedLogo || undefined,
      contentPreferences: {
        style: contentPreferences.style || "balanced",
        useVideo: contentPreferences.useVideo ?? false,
        tone: contentPreferences.tone || "professional"
      },
      generatedContent: generatedContent.length > 0 ? generatedContent : [],
      crmIntegration: Object.keys(crmIntegration).length > 0 ? crmIntegration : undefined,
      userAccountsMembership: Object.keys(userAccountsMembership).length > 0 ? userAccountsMembership : undefined,
      imageRequirements: {
        logoNeeds: imageRequirements.logoNeeds || "need-logo",
        logoDescription: imageRequirements.logoDescription || undefined,
        specificImages: imageRequirements.specificImages || undefined,
        teamPhotos: imageRequirements.teamPhotos ?? false,
        productPhotos: imageRequirements.productPhotos ?? false,
        facilityPhotos: imageRequirements.facilityPhotos ?? false,
        preferredPhotoStyle: imageRequirements.preferredPhotoStyle || undefined,
        stockPhotoPreference: imageRequirements.stockPhotoPreference || undefined,
        additionalNotes: imageRequirements.additionalNotes || ""
      },
      designPreferences: {
        selectedStyle: designPreferences.selectedStyle || "modern",
        preferredFont: designPreferences.preferredFont || undefined,
        primaryColor: designPreferences.primaryColor || undefined,
        secondaryColor: designPreferences.secondaryColor || undefined,
        accentColor: designPreferences.accentColor || undefined,
        backgroundColor: designPreferences.backgroundColor || undefined,
        textColor: designPreferences.textColor || undefined,
        inspirationLinks: designPreferences.inspirationLinks || [],
        additionalNotes: designPreferences.additionalNotes || ""
      }
    };
  };

  // Helper function to build update data (only changed fields)
  const buildUpdateData = (): Partial<InsertProjectSubmission> => {
    const updateData: Partial<InsertProjectSubmission> = {};
    
    // Only include fields that have actual values
    if (fullName?.trim()) updateData.fullName = fullName.trim();
    if (email?.trim()) updateData.email = email.trim();
    if (contactNumber?.trim()) updateData.contactNumber = contactNumber.trim();
    if (businessName?.trim()) updateData.businessName = businessName.trim();
    if (businessDescription?.trim()) updateData.businessDescription = businessDescription.trim();
    if (selectedSiteType) updateData.selectedSiteType = selectedSiteType;
    if (pages.length > 0) updateData.pages = pages;
    if (logoDecision) updateData.logoDecision = logoDecision;
    if (logoFile) updateData.logoFile = 'uploaded_file';
    if (selectedLogo) updateData.selectedLogo = selectedLogo;
    if (Object.keys(crmIntegration).length > 0) updateData.crmIntegration = crmIntegration;
    if (Object.keys(userAccountsMembership).length > 0) updateData.userAccountsMembership = userAccountsMembership;
    
    // Always update these objects if they have any meaningful content
    if (contentPreferences.tone || contentPreferences.style || contentPreferences.useVideo !== undefined) {
      updateData.contentPreferences = contentPreferences;
    }
    
    if (generatedContent.length > 0) {
      updateData.generatedContent = generatedContent;
    }
    
    if (imageRequirements.logoNeeds || (imageRequirements.specificImages && imageRequirements.specificImages.length > 0) || imageRequirements.additionalNotes) {
      updateData.imageRequirements = imageRequirements;
    }
    
    if (designPreferences.selectedStyle || designPreferences.preferredFont || designPreferences.primaryColor || designPreferences.inspirationLinks?.length > 0 || designPreferences.additionalNotes) {
      updateData.designPreferences = {
        selectedStyle: designPreferences.selectedStyle || "modern",
        preferredFont: designPreferences.preferredFont || undefined,
        primaryColor: designPreferences.primaryColor || undefined,
        secondaryColor: designPreferences.secondaryColor || undefined,
        accentColor: designPreferences.accentColor || undefined,
        backgroundColor: designPreferences.backgroundColor || undefined,
        textColor: designPreferences.textColor || undefined,
        inspirationLinks: designPreferences.inspirationLinks || [],
        additionalNotes: designPreferences.additionalNotes || ""
      };
    }
    
    return updateData;
  };

  // Function to save current progress to database
  const saveProgress = async (stepCompleted: number) => {
    if (isSavingProgress) return; // Prevent multiple simultaneous saves
    
    setIsSavingProgress(true);
    
    try {
      if (currentProjectId) {
        // Update existing project - only send changed fields
        const updateData = buildUpdateData();
        if (Object.keys(updateData).length > 0) {
          await updateProjectMutation.mutateAsync({ id: currentProjectId, data: updateData });
        }
      } else {
        // Create new project only if we have minimum required data
        const projectData = buildProjectData();
        if (projectData) {
          const result = await createProjectMutation.mutateAsync(projectData);
          setCurrentProjectId(result.id);
        }
      }
    } catch (error) {
      // Only log error, don't show toast for expected validation issues
      console.error('Error saving progress:', error);
    } finally {
      setIsSavingProgress(false);
    }
  };

  // User Accounts & Membership form setup
  const membershipForm = useForm<UserAccountsMembership>({
    resolver: zodResolver(userAccountsMembershipSchema),
    defaultValues: userAccountsMembership
  });

  const onMembershipSubmit = (data: UserAccountsMembership) => {
    setUserAccountsMembership(data);
  };

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
                     (logoPath === 'generate' && logoPreferences.types.length > 0 && logoPreferences.styles.length > 0);
      case 4: return selectedSiteType !== "";
      case 5: return pages.length >= 2;
      case 6: return generatedContent.length > 0; // Copy step - require content generation
      case 7: return Boolean((crmIntegration.selectedCrms.length > 0 || crmIntegration.selectedMarketingAutomation.length > 0 || crmIntegration.selectedPaymentGateways.length > 0 || (crmIntegration.apiIntegrations && crmIntegration.apiIntegrations.trim().length > 0) || crmIntegration.selectedAutomationPlatforms.length > 0 || crmIntegration.selectedEngagementFeatures.length > 0 || crmIntegration.selectedECommerceFeatures.length > 0) && 
        (!crmIntegration.selectedCrms.includes('custom') || (crmIntegration.customCrmNames && crmIntegration.customCrmNames.length > 0 && crmIntegration.customCrmNames.some(name => name?.trim()))) &&
        (!crmIntegration.selectedMarketingAutomation.includes('custom') || (crmIntegration.customMarketingAutomationNames && crmIntegration.customMarketingAutomationNames.length > 0 && crmIntegration.customMarketingAutomationNames.some(name => name?.trim()))) &&
        (!crmIntegration.selectedPaymentGateways.includes('custom') || (crmIntegration.customPaymentGatewayNames && crmIntegration.customPaymentGatewayNames.length > 0 && crmIntegration.customPaymentGatewayNames.some(name => name?.trim())))); // Integrations step
      case 8: return membershipForm.formState.isValid; // User Accounts & Membership step
      case 9: return true; // Media step - optional
      case 10: return designPreferences.selectedStyle !== "";
      case 11: return true; // Review step
      default: return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const nextStep = async () => {
    if (canProceed && currentStep < steps.length) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));
      
      // Save progress to database
      await saveProgress(currentStep);
      
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
      // Collect page directions from existing content
      const pageDirections = generatedContent
        .filter(content => content.pageDirection && content.pageDirection.trim() !== '')
        .map(content => ({
          pageId: content.pageId,
          direction: content.pageDirection!
        }));

      const response = await apiRequest('POST', '/api/content/generate', {
        businessName,
        businessDescription,
        siteType: selectedSiteType,
        pages: pages.map(p => ({ id: p.id, name: p.name, path: p.path })),
        preferences: contentPreferences,
        pageDirections: pageDirections
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

  // Function to update page direction
  const updatePageDirection = (pageId: string, direction: string) => {
    setGeneratedContent(prevContent => {
      const existingIndex = prevContent.findIndex(content => content.pageId === pageId);
      
      if (existingIndex >= 0) {
        // Update existing entry
        return prevContent.map(content => 
          content.pageId === pageId 
            ? { ...content, pageDirection: direction }
            : content
        );
      } else {
        // Create new entry for the page direction
        const page = pages.find(p => p.id === pageId);
        if (page) {
          return [...prevContent, {
            pageId: pageId,
            pageName: page.name,
            content: '',
            pageDirection: direction,
            suggestions: [],
            hasEdits: false
          }];
        }
        return prevContent;
      }
    });
  };

  // Function to update page content (editing)
  const updatePageContent = (pageId: string, newContent: string) => {
    setGeneratedContent(prevContent => 
      prevContent.map(content => 
        content.pageId === pageId 
          ? { 
              ...content, 
              editedContent: newContent,
              hasEdits: newContent !== content.content
            }
          : content
      )
    );
  };

  // Function to regenerate content for a specific page
  const regeneratePageContent = async (page: Page) => {
    if (isGeneratingContent) return;
    
    setIsGeneratingContent(true);
    console.log(`Regenerating content for ${page.name} page...`);
    
    try {
      const pageContent = generatedContent.find(content => content.pageId === page.id);
      const customDirection = pageContent?.pageDirection || '';
      
      const response = await apiRequest('POST', '/api/content/regenerate', {
        businessName,
        businessDescription,
        siteType: selectedSiteType,
        page: { id: page.id, name: page.name, path: page.path },
        preferences: contentPreferences,
        pageDirection: customDirection
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to regenerate content');
      }
      
      const data = await response.json() as { content: GeneratedContent };
      
      // Update the specific page content
      setGeneratedContent(prevContent => 
        prevContent.map(content => 
          content.pageId === page.id 
            ? { 
                ...data.content, 
                pageDirection: customDirection,
                hasEdits: false // Reset edit flag for regenerated content
              }
            : content
        )
      );
      
      toast({
        title: "Content Regenerated!",
        description: `Updated content for ${page.name} page.`
      });
    } catch (error: any) {
      console.error('Content regeneration error:', error);
      toast({
        title: "Regeneration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const exportPDF = async () => {
    console.log('Exporting creative brief as PDF...');
    
    try {
      // Import libraries dynamically
      const { jsPDF } = await import('jspdf');
      const JSZip = (await import('jszip')).default;
        const doc = new jsPDF();
        let yPosition = 20;
        const lineHeight = 8;
        const pageWidth = 210;
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Creative Brief', margin, yPosition);
        yPosition += lineHeight * 2;

        // Business Information
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Business Information', margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Business Name: ${businessName}`, margin, yPosition);
        yPosition += lineHeight;
        
        // Split long description text
        const descriptionLines = doc.splitTextToSize(`Description: ${businessDescription}`, maxWidth);
        doc.text(descriptionLines, margin, yPosition);
        yPosition += lineHeight * descriptionLines.length + 5;

        // Website Type & Pages
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Website Information', margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Website Type: ${selectedSiteType}`, margin, yPosition);
        yPosition += lineHeight + 3;
        
        doc.text('Pages:', margin, yPosition);
        yPosition += lineHeight;
        pages.forEach(page => {
          doc.text(`• ${page.name} (${page.path})`, margin + 5, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 5;

        // Logo Information
        if (logoDecision || logoFile) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Branding & Logo', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          
          // Try to embed the logo image
          try {
            if (logoFile && logoFile instanceof File) {
              // For uploaded logo files - handle async FileReader
              const logoDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    resolve(e.target.result as string);
                  } else {
                    reject(new Error('Failed to read file'));
                  }
                };
                reader.onerror = () => reject(new Error('FileReader error'));
                reader.readAsDataURL(logoFile);
              });
              
              // Detect image format from data URL
              const imageFormat = logoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
              doc.addImage(logoDataUrl, imageFormat, margin, yPosition, 30, 20);
              yPosition += 25;
              doc.text('Logo: Custom logo uploaded', margin, yPosition);
              yPosition += lineHeight + 5;
            } else if (selectedLogo && selectedLogo.dataUrl) {
              // For AI-generated logos
              const imageFormat = selectedLogo.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
              doc.addImage(selectedLogo.dataUrl, imageFormat, margin, yPosition, 30, 20);
              yPosition += 25;
              doc.text('Logo: AI-generated logo selected', margin, yPosition);
              yPosition += lineHeight + 5;
            } else {
              // Fallback text-only
              if (logoFile) {
                doc.text('Logo: Custom logo uploaded', margin, yPosition);
              } else if (selectedLogo) {
                doc.text('Logo: AI-generated logo selected', margin, yPosition);
              }
              yPosition += lineHeight + 5;
            }
          } catch (logoError) {
            console.log('Could not embed logo in PDF:', logoError);
            // Fallback to text description
            if (logoFile) {
              doc.text('Logo: Custom logo uploaded', margin, yPosition);
            } else if (selectedLogo) {
              doc.text('Logo: AI-generated logo selected', margin, yPosition);
            }
            yPosition += lineHeight + 5;
          }
        }

        // Content Preferences
        if (contentPreferences) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Content Preferences', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Style: ${contentPreferences.style}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`Tone: ${contentPreferences.tone}`, margin, yPosition);
          yPosition += lineHeight;
          doc.text(`Video Content: ${contentPreferences.useVideo ? 'Yes' : 'No'}`, margin, yPosition);
          yPosition += lineHeight + 5;
        }

        // Image Requirements
        if (imageRequirements) {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Image & Media Requirements', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Logo Needs: ${imageRequirements.logoNeeds}`, margin, yPosition);
          yPosition += lineHeight;
          
          if (imageRequirements.logoDescription) {
            const logoDescLines = doc.splitTextToSize(`Logo Description: ${imageRequirements.logoDescription}`, maxWidth);
            doc.text(logoDescLines, margin, yPosition);
            yPosition += lineHeight * logoDescLines.length;
          }
          
          doc.text('Photo Types Needed:', margin, yPosition);
          yPosition += lineHeight;
          if (imageRequirements.teamPhotos) doc.text('• Team/Staff Photos', margin + 5, yPosition), yPosition += lineHeight;
          if (imageRequirements.productPhotos) doc.text('• Product Photos', margin + 5, yPosition), yPosition += lineHeight;
          if (imageRequirements.facilityPhotos) doc.text('• Facility Photos', margin + 5, yPosition), yPosition += lineHeight;
          
          if (imageRequirements.preferredPhotoStyle) {
            doc.text(`Photo Style: ${imageRequirements.preferredPhotoStyle}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          if (imageRequirements.stockPhotoPreference) {
            doc.text(`Stock Photo Preference: ${imageRequirements.stockPhotoPreference}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          if (imageRequirements.specificImages && imageRequirements.specificImages.length > 0) {
            doc.text('Specific Images Needed:', margin, yPosition);
            yPosition += lineHeight;
            imageRequirements.specificImages.forEach(image => {
              const imageLines = doc.splitTextToSize(`• ${image}`, maxWidth - 5);
              doc.text(imageLines, margin + 5, yPosition);
              yPosition += lineHeight * imageLines.length;
            });
          }
          yPosition += 5;
        }

        // Integrations
        if (crmIntegration && (crmIntegration.selectedCrms?.length > 0 || crmIntegration.selectedMarketingAutomation?.length > 0 || crmIntegration.selectedPaymentGateways?.length > 0 || crmIntegration.apiIntegrations?.trim() || crmIntegration.selectedAutomationPlatforms?.length > 0 || crmIntegration.selectedEngagementFeatures?.length > 0 || crmIntegration.selectedAdvancedFeatures?.length > 0 || crmIntegration.selectedECommerceFeatures?.length > 0)) {
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Integrations', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');

          // CRM Platforms
          if (crmIntegration.selectedCrms?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('CRM Platforms:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const crmDisplayNames: Record<string, string> = {
              'salesforce': 'Salesforce',
              'hubspot': 'HubSpot',
              'zoho-crm': 'Zoho CRM',
              'pipedrive': 'Pipedrive',
              'microsoft-dynamics-365': 'Microsoft Dynamics 365',
              'freshsales': 'Freshsales',
              'ontraport': 'Ontraport',
              'nimble': 'Nimble',
              'nutshell': 'Nutshell',
              'membrain': 'Membrain',
              'sugarcrm': 'SugarCRM'
            };
            
            crmIntegration.selectedCrms.forEach(crm => {
              if (crm === 'custom') {
                if (crmIntegration.customCrmNames && crmIntegration.customCrmNames.length > 0) {
                  crmIntegration.customCrmNames.filter(name => name.trim()).forEach(customName => {
                    doc.text(`• ${customName}`, margin + 5, yPosition);
                    yPosition += lineHeight;
                  });
                }
              } else {
                doc.text(`• ${crmDisplayNames[crm] || crm}`, margin + 5, yPosition);
                yPosition += lineHeight;
              }
            });
            yPosition += 3;
          }

          // Marketing Automation
          if (crmIntegration.selectedMarketingAutomation?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Marketing Automation:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const marketingDisplayNames: Record<string, string> = {
              'klaviyo': 'Klaviyo',
              'hubspot': 'HubSpot',
              'activecampaign': 'ActiveCampaign',
              'mailchimp': 'Mailchimp',
              'brevo': 'Brevo',
              'marketo-engage': 'Marketo Engage',
              'pardot': 'Pardot'
            };
            
            crmIntegration.selectedMarketingAutomation.forEach(platform => {
              if (platform === 'custom') {
                if (crmIntegration.customMarketingAutomationNames && crmIntegration.customMarketingAutomationNames.length > 0) {
                  crmIntegration.customMarketingAutomationNames.filter(name => name.trim()).forEach(customName => {
                    doc.text(`• ${customName}`, margin + 5, yPosition);
                    yPosition += lineHeight;
                  });
                }
              } else {
                doc.text(`• ${marketingDisplayNames[platform] || platform}`, margin + 5, yPosition);
                yPosition += lineHeight;
              }
            });
            yPosition += 3;
          }

          // Payment Gateways
          if (crmIntegration.selectedPaymentGateways?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Gateways:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const paymentDisplayNames: Record<string, string> = {
              'stripe': 'Stripe',
              'paypal': 'PayPal',
              'square': 'Square',
              'authorize-net': 'Authorize.net',
              'amazon-pay': 'Amazon Pay',
              'apple-pay': 'Apple Pay',
              'bank-transfer': 'Bank Transfer'
            };
            
            crmIntegration.selectedPaymentGateways.forEach(gateway => {
              if (gateway === 'custom') {
                if (crmIntegration.customPaymentGatewayNames && crmIntegration.customPaymentGatewayNames.length > 0) {
                  crmIntegration.customPaymentGatewayNames.filter(name => name.trim()).forEach(customName => {
                    doc.text(`• ${customName}`, margin + 5, yPosition);
                    yPosition += lineHeight;
                  });
                }
              } else {
                doc.text(`• ${paymentDisplayNames[gateway] || gateway}`, margin + 5, yPosition);
                yPosition += lineHeight;
              }
            });
            yPosition += 3;
          }

          // API Integrations
          if (crmIntegration.apiIntegrations?.trim()) {
            doc.setFont('helvetica', 'bold');
            doc.text('API Integrations:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            const apiLines = doc.splitTextToSize(crmIntegration.apiIntegrations, maxWidth);
            doc.text(apiLines, margin, yPosition);
            yPosition += lineHeight * apiLines.length + 3;
          }

          // Automation Platforms
          if (crmIntegration.selectedAutomationPlatforms?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Automation Platforms:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const automationDisplayNames: Record<string, string> = {
              'zapier': 'Zapier',
              'make-integromat': 'Make (Integromat)',
              'microsoft-power-automate': 'Microsoft Power Automate',
              'ifttt': 'IFTTT',
              'pipedream': 'Pipedream',
              'workato': 'Workato'
            };
            
            crmIntegration.selectedAutomationPlatforms.forEach(platform => {
              doc.text(`• ${automationDisplayNames[platform] || platform}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
            yPosition += 3;
          }

          // Engagement Features
          if (crmIntegration.selectedEngagementFeatures?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Engagement Features:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const engagementDisplayNames: Record<string, string> = {
              'live-chat-intercom-drift': 'Live Chat (Intercom, Drift, etc.)',
              'helpdesk-zendesk-freshdesk': 'Helpdesk (Zendesk, Freshdesk, etc.)',
              'social-media-integration': 'Social Media Integration',
              'review-management': 'Review Management',
              'loyalty-programs': 'Loyalty Programs',
              'referral-systems': 'Referral Systems'
            };
            
            crmIntegration.selectedEngagementFeatures.forEach(feature => {
              doc.text(`• ${engagementDisplayNames[feature] || feature}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
            yPosition += 3;
          }

          // Advanced Features
          if (crmIntegration.selectedAdvancedFeatures?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('Advanced Features:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const advancedDisplayNames: Record<string, string> = {
              'multilingual-translation-support': 'Multilingual / Translation Support',
              'seo-tools-meta-sitemap-schema': 'SEO Tools (meta tags, sitemap, schema)',
              'analytics-integration-ga4-hotjar': 'Analytics Integration (GA4, Hotjar, etc.)',
              'security-features-ssl-captcha-2fa': 'Security Features (SSL, Captcha, 2FA)',
              'custom-forms-workflows': 'Custom Forms & Workflows',
              'chatbots-ai-powered-scripted': 'Chatbots (AI-powered or scripted)'
            };
            
            crmIntegration.selectedAdvancedFeatures.forEach(feature => {
              doc.text(`• ${advancedDisplayNames[feature] || feature}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
            yPosition += 3;
          }

          // E-Commerce Features
          if (crmIntegration.selectedECommerceFeatures?.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('E-Commerce Features:', margin, yPosition);
            yPosition += lineHeight;
            doc.setFont('helvetica', 'normal');
            
            const ecommerceDisplayNames: Record<string, string> = {
              'online-store-shopify-woocommerce': 'Online Store (Shopify / WooCommerce)',
              'product-catalog': 'Product Catalog',
              'shopping-cart-checkout': 'Shopping Cart & Checkout',
              'digital-downloads': 'Digital Downloads',
              'inventory-management': 'Inventory Management',
              'subscription-products': 'Subscription Products',
              'multi-currency-support': 'Multi-Currency Support',
              'discount-codes-coupons': 'Discount Codes / Coupons'
            };
            
            crmIntegration.selectedECommerceFeatures.forEach(feature => {
              doc.text(`• ${ecommerceDisplayNames[feature] || feature}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
            yPosition += 3;
          }
          
          yPosition += 5;
        }

        // User Accounts & Membership
        if (userAccountsMembership && (userAccountsMembership.registrationLogin || userAccountsMembership.userDashboardNeeded || (userAccountsMembership.predefinedRoles?.length > 0 || userAccountsMembership.customRoles?.length > 0) || userAccountsMembership.membershipSubscriptionSystem)) {
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('User Accounts & Membership', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');

          if (userAccountsMembership.registrationLogin) {
            doc.text('• User Registration & Login: Yes', margin, yPosition);
            yPosition += lineHeight;
          }

          if (userAccountsMembership.userDashboardNeeded) {
            doc.text('• User Dashboard: Yes', margin, yPosition);
            yPosition += lineHeight;
            
            if (userAccountsMembership.userDashboardFeatures?.trim()) {
              const dashboardLines = doc.splitTextToSize(`  Dashboard Features: ${userAccountsMembership.userDashboardFeatures}`, maxWidth);
              doc.text(dashboardLines, margin, yPosition);
              yPosition += lineHeight * dashboardLines.length;
            }
          }

          if (userAccountsMembership.predefinedRoles && userAccountsMembership.predefinedRoles.length > 0) {
            doc.text('Predefined User Roles:', margin, yPosition);
            yPosition += lineHeight;
            
            const roleDisplayNames: Record<string, string> = {
              'admin': 'Administrator',
              'editor': 'Editor',
              'contributor': 'Contributor',
              'subscriber': 'Subscriber',
              'customer': 'Customer',
              'member': 'Member',
              'moderator': 'Moderator',
              'guest': 'Guest'
            };
            
            userAccountsMembership.predefinedRoles.forEach(role => {
              doc.text(`• ${roleDisplayNames[role] || role}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          }

          if (userAccountsMembership.customRoles && userAccountsMembership.customRoles.length > 0) {
            doc.text('Custom User Roles:', margin, yPosition);
            yPosition += lineHeight;
            
            userAccountsMembership.customRoles.forEach(role => {
              const roleText = role.description ? `${role.name} (${role.description})` : role.name;
              const roleLines = doc.splitTextToSize(`• ${roleText}`, maxWidth - 5);
              doc.text(roleLines, margin + 5, yPosition);
              yPosition += lineHeight * roleLines.length;
            });
          }

          if (userAccountsMembership.membershipSubscriptionSystem) {
            doc.text('• Membership/Subscription System: Yes', margin, yPosition);
            yPosition += lineHeight;
            
            if (userAccountsMembership.membershipDetails?.trim()) {
              const membershipLines = doc.splitTextToSize(`  Details: ${userAccountsMembership.membershipDetails}`, maxWidth);
              doc.text(membershipLines, margin, yPosition);
              yPosition += lineHeight * membershipLines.length;
            }
          }
          
          yPosition += 5;
        }

        // Uploaded Media Files
        if (mediaFiles && mediaFiles.length > 0) {
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Uploaded Media Files', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          
          mediaFiles.forEach((file, index) => {
            const fileSize = (file.size / 1024 / 1024).toFixed(2);
            doc.text(`• ${file.name} (${fileSize} MB)`, margin, yPosition);
            yPosition += lineHeight;
          });
          
          yPosition += 5;
        }

        // Design Preferences
        if (designPreferences.selectedStyle) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Design Preferences', margin, yPosition);
          yPosition += lineHeight;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Design Style: ${designPreferences.selectedStyle}`, margin, yPosition);
          yPosition += lineHeight;
          
          // Preferred Font
          if (designPreferences.preferredFont) {
            doc.text(`Preferred Font: ${designPreferences.preferredFont}`, margin, yPosition);
            yPosition += lineHeight;
          }
          
          // Color Scheme
          const hasColors = designPreferences.primaryColor || designPreferences.secondaryColor || 
                          designPreferences.accentColor || designPreferences.backgroundColor || 
                          designPreferences.textColor;
          
          if (hasColors) {
            doc.text('Color Scheme:', margin, yPosition);
            yPosition += lineHeight;
            
            // Primary Color with visual preview
            if (designPreferences.primaryColor) {
              doc.text(`• Primary: ${designPreferences.primaryColor}`, margin + 5, yPosition);
              // Add a small colored rectangle
              doc.setFillColor(designPreferences.primaryColor);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'F');
              yPosition += lineHeight;
            }
            
            // Secondary Color with visual preview
            if (designPreferences.secondaryColor) {
              doc.text(`• Secondary: ${designPreferences.secondaryColor}`, margin + 5, yPosition);
              doc.setFillColor(designPreferences.secondaryColor);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'F');
              yPosition += lineHeight;
            }
            
            // Accent Color with visual preview
            if (designPreferences.accentColor) {
              doc.text(`• Accent: ${designPreferences.accentColor}`, margin + 5, yPosition);
              doc.setFillColor(designPreferences.accentColor);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'F');
              yPosition += lineHeight;
            }
            
            // Background Color with visual preview
            if (designPreferences.backgroundColor) {
              doc.text(`• Background: ${designPreferences.backgroundColor}`, margin + 5, yPosition);
              doc.setFillColor(designPreferences.backgroundColor);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'F');
              // Add border for light backgrounds
              doc.setDrawColor(200, 200, 200);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'S');
              yPosition += lineHeight;
            }
            
            // Text Color with visual preview
            if (designPreferences.textColor) {
              doc.text(`• Text: ${designPreferences.textColor}`, margin + 5, yPosition);
              doc.setFillColor(designPreferences.textColor);
              doc.rect(margin + 85, yPosition - 4, 8, 6, 'F');
              yPosition += lineHeight;
            }
            
            yPosition += 3; // Add spacing after colors
          }
          
          if (designPreferences.inspirationLinks.length > 0) {
            doc.text('Inspiration Links:', margin, yPosition);
            yPosition += lineHeight;
            designPreferences.inspirationLinks.forEach(link => {
              doc.text(`• ${link}`, margin + 5, yPosition);
              yPosition += lineHeight;
            });
          }
          
          if (designPreferences.additionalNotes) {
            const notesLines = doc.splitTextToSize(`Additional Notes: ${designPreferences.additionalNotes}`, maxWidth);
            doc.text(notesLines, margin, yPosition);
            yPosition += lineHeight * notesLines.length;
          }
        }

        // Generated Content Full Details
        if (generatedContent.length > 0) {
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Generated Content', margin, yPosition);
          yPosition += lineHeight * 2;
          
          generatedContent.forEach((content, index) => {
            // Check if we need a new page for each content section
            if (yPosition > 200) {
              doc.addPage();
              yPosition = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${content.pageName} Page`, margin, yPosition);
            yPosition += lineHeight;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            // Split content into multiple lines
            const contentLines = doc.splitTextToSize(content.content, maxWidth);
            doc.text(contentLines, margin, yPosition);
            yPosition += lineHeight * contentLines.length + 10;
          });
        }

        // Footer
        const currentDate = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Generated on ${currentDate}`, margin, 280);

        // Helper function to sanitize filenames for cross-platform compatibility
        const sanitizeFilename = (filename: string) => {
          return filename.replace(/[\\/:*?"<>|]/g, '_').trim();
        };

        const sanitizedBusinessName = sanitizeFilename(businessName || 'Creative Brief');

        // Save the PDF
        doc.save(`${sanitizedBusinessName}_${currentDate.replace(/\//g, '-')}.pdf`);
        
        // Create and download zip file with uploaded images and logos if any exist
        const imageFiles = mediaFiles ? mediaFiles.filter(file => file.type.startsWith('image/')) : [];
        const hasLogo = logoFile || selectedLogo;
        
        if (imageFiles.length > 0 || hasLogo) {
          console.log('Creating zip file with uploaded images and logos...');
          const zip = new JSZip();
          let imagesAdded = 0;
          let logosAdded = 0;
          
          // Add each image file to the zip
          for (const file of imageFiles) {
            zip.file(file.name, file);
            imagesAdded++;
          }
          
          // Add uploaded logo file if it exists
          if (logoFile && logoFile instanceof File) {
            zip.file(`logo_uploaded_${logoFile.name}`, logoFile);
            logosAdded++;
          }
          
          // Add AI-generated logo if it exists
          if (selectedLogo && selectedLogo.dataUrl) {
            try {
              // Parse mime type from data URL for proper extension
              const mimeMatch = selectedLogo.dataUrl.match(/^data:([^;]+);?/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
              
              let extension = 'png'; // default
              if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
              else if (mimeType.includes('png')) extension = 'png';
              else if (mimeType.includes('webp')) extension = 'webp';
              else if (mimeType.includes('svg')) extension = 'svg';
              
              // Convert data URL to blob
              const response = await fetch(selectedLogo.dataUrl);
              const logoBlob = await response.blob();
              
              // Use blob type as fallback if data URL parsing failed
              if (extension === 'png' && logoBlob.type && logoBlob.type !== 'image/png') {
                if (logoBlob.type.includes('jpeg') || logoBlob.type.includes('jpg')) extension = 'jpg';
                else if (logoBlob.type.includes('webp')) extension = 'webp';
                else if (logoBlob.type.includes('svg')) extension = 'svg';
              }
              
              zip.file(`logo_generated.${extension}`, logoBlob);
              logosAdded++;
            } catch (logoError) {
              console.log('Could not include AI-generated logo in zip:', logoError);
            }
          }
          
          const totalFiles = imagesAdded + logosAdded;
          
          // Only generate and download zip if files were actually added
          if (totalFiles > 0) {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);
            const zipLink = document.createElement('a');
            zipLink.href = zipUrl;
            zipLink.download = `${sanitizedBusinessName}_Images_${currentDate.replace(/\//g, '-')}.zip`;
            document.body.appendChild(zipLink);
            zipLink.click();
            document.body.removeChild(zipLink);
            URL.revokeObjectURL(zipUrl);
            
            // Create descriptive message based on what was included
            let description = "Your creative brief PDF and ";
            if (imagesAdded > 0 && logosAdded > 0) {
              description += `${imagesAdded} image${imagesAdded > 1 ? 's' : ''} and ${logosAdded} logo${logosAdded > 1 ? 's' : ''} zip have been exported.`;
            } else if (imagesAdded > 0) {
              description += `${imagesAdded} image${imagesAdded > 1 ? 's' : ''} zip have been exported.`;
            } else {
              description += `${logosAdded} logo${logosAdded > 1 ? 's' : ''} zip have been exported.`;
            }
            
            toast({
              title: "Files Downloaded!",
              description: description
            });
          } else {
            toast({
              title: "PDF Downloaded!",
              description: "Your creative brief has been exported as a PDF. No images or logos were available to include in a zip file."
            });
          }
        } else {
          toast({
            title: "PDF Downloaded!",
            description: "Your creative brief has been exported as a PDF."
          });
        }
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const submitProject = async () => {
    console.log('Submitting project...');
    
    try {
      // Prepare submission data
      const submissionData = {
        businessName,
        businessDescription,
        selectedSiteType,
        pages,
        ...(logoDecision && { logoDecision }), // Only include if not null
        logoFile: logoFile ? 'uploaded_file' : undefined, // In production, convert to base64 or upload separately
        ...(selectedLogo && { selectedLogo }), // Only include if not null
        contentPreferences,
        generatedContent,
        crmIntegration,
        userAccountsMembership,
        imageRequirements,
        designPreferences
      };

      // Submit to backend
      const response = await apiRequest('POST', '/api/project/submit', submissionData);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit project');
      }

      const result = await response.json();
      
      toast({
        title: "Project Submitted!",
        description: result.message || "Your creative brief has been submitted successfully."
      });

      // Set submission state to show Thank You page
      setIsProjectSubmitted(true);
      setCompletedSteps(prev => new Set([...Array.from(prev), 11]));

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit project. Please try again.",
        variant: "destructive"
      });
    }
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
          <div className="space-y-6">
            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      data-testid="input-full-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border rounded-md"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full p-3 border rounded-md"
                    data-testid="input-contact-number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information Section */}
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
          </div>
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
                    onPreferencesChange={(preferences) => {
                      setLogoPreferences(preferences);
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
            <CardContent className="space-y-8">
              <SitemapBuilder
                pages={pages}
                onPagesUpdate={setPages}
                suggestedPages={suggestedPages}
              />
              
              {/* Core Website Features Section */}
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Core Website Features</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the essential features you'd like to include on your website
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Newsletter Signup',
                      'Search Functionality', 
                      'Contact Form',
                      'Contact Form with Conditional Logic',
                      'Blog / News Section',
                      'Photo Galleries / Sliders',
                      'Video Backgrounds / Embeds',
                      'Podcast / Audio Player',
                      'Resource Library (PDFs, Whitepapers)',
                      'Download Center'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <Checkbox
                          checked={coreWebsiteFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCoreWebsiteFeatures(prev => [...prev, feature]);
                            } else {
                              setCoreWebsiteFeatures(prev => prev.filter(f => f !== feature));
                            }
                          }}
                          data-testid={`checkbox-core-feature-${feature.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        />
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                {generatedContent.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate content to continue to the next step
                  </p>
                )}
              </div>
              
              {/* Enhanced Content Editor Display */}
              <div className="grid gap-6">
                {pages.map((page) => {
                  const pageContent = generatedContent.find(content => content.pageId === page.id);
                  return (
                    <Card key={page.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{page.name} Page</CardTitle>
                          {pageContent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => regeneratePageContent(page)}
                              disabled={isGeneratingContent}
                              className="gap-2"
                              data-testid={`button-regenerate-${page.id}`}
                            >
                              <RefreshCw className="w-3 h-3" />
                              Regenerate
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Page Direction Field */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Additional Direction for {page.name} Page (Optional)
                          </label>
                          <Textarea
                            placeholder={`Provide specific guidance for the ${page.name.toLowerCase()} page content (e.g., "Focus on our 24/7 customer support", "Mention our 15-year experience", "Include pricing tiers")`}
                            value={pageContent?.pageDirection || ''}
                            onChange={(e) => updatePageDirection(page.id, e.target.value)}
                            className="min-h-[60px]"
                            data-testid={`textarea-direction-${page.id}`}
                          />
                        </div>

                        {pageContent ? (
                          <div className="space-y-4">
                            {/* Editable Content Area */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Generated Content</label>
                                {pageContent.hasEdits && (
                                  <Badge variant="secondary" className="text-xs">
                                    Edited
                                  </Badge>
                                )}
                              </div>
                              <Textarea
                                value={pageContent.editedContent || pageContent.content}
                                onChange={(e) => updatePageContent(page.id, e.target.value)}
                                className="min-h-[200px] text-sm"
                                placeholder="Edit the generated content for this page..."
                                data-testid={`textarea-content-${page.id}`}
                              />
                            </div>

                            {/* Suggestions */}
                            {pageContent.suggestions && pageContent.suggestions.length > 0 && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-2">AI Suggestions:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {pageContent.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary mt-0.5">•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>AI-generated content will appear here for the {page.name.toLowerCase()} page.</p>
                            <p className="text-xs mt-1">Click "Generate Page Content" above to get started.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
              <CardTitle>Integrations</CardTitle>
              <p className="text-muted-foreground">
                Select your CRM and Marketing Automation platforms for customer management and campaign automation
              </p>
            </CardHeader>
            <CardContent>
              <Form {...crmForm}>
                <form className="space-y-6">
                  <FormField
                    control={crmForm.control}
                    name="selectedCrms"
                    render={() => (
                      <FormItem>
                        <FormLabel>CRM Platforms</FormLabel>
                        <FormDescription className="mb-4">
                          Select all CRM platforms you want to integrate with
                        </FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { id: 'salesforce', label: 'Salesforce' },
                            { id: 'hubspot', label: 'HubSpot' },
                            { id: 'zoho-crm', label: 'Zoho CRM' },
                            { id: 'pipedrive', label: 'Pipedrive' },
                            { id: 'microsoft-dynamics-365', label: 'Microsoft Dynamics 365' },
                            { id: 'freshsales', label: 'Freshsales' },
                            { id: 'ontraport', label: 'Ontraport' },
                            { id: 'nimble', label: 'Nimble' },
                            { id: 'nutshell', label: 'Nutshell' },
                            { id: 'membrain', label: 'Membrain' },
                            { id: 'sugarcrm', label: 'SugarCRM' },
                            { id: 'custom', label: 'Add custom CRM' }
                          ].map((crm) => (
                            <FormItem key={crm.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={crmIntegration.selectedCrms.includes(crm.id as any)}
                                  onCheckedChange={(checked) => {
                                    const updatedCrms = checked
                                      ? [...crmIntegration.selectedCrms, crm.id as any]
                                      : crmIntegration.selectedCrms.filter(id => id !== crm.id);
                                    setCrmIntegration(prev => ({ ...prev, selectedCrms: updatedCrms }));
                                    crmForm.setValue('selectedCrms', updatedCrms);
                                  }}
                                  data-testid={`checkbox-crm-${crm.id}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {crm.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {crmIntegration.selectedCrms.includes('custom') && (
                    <FormField
                      control={crmForm.control}
                      name="customCrmNames"
                      render={() => (
                        <FormItem>
                          <FormLabel>Custom CRM Names</FormLabel>
                          <FormDescription>
                            Enter the names of your custom CRM platforms (one per line)
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Enter custom CRM names, one per line"
                              value={(crmIntegration.customCrmNames || []).join('\n')}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                setCrmIntegration(prev => ({ ...prev, customCrmNames: lines }));
                                crmForm.setValue('customCrmNames', lines);
                              }}
                              data-testid="textarea-custom-crm-names"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="border-t pt-6 mt-6">
                    <FormField
                      control={crmForm.control}
                      name="selectedMarketingAutomation"
                      render={() => (
                        <FormItem>
                          <FormLabel>Marketing Automation Platforms</FormLabel>
                          <FormDescription className="mb-4">
                            Select all marketing automation platforms you want to integrate with
                          </FormDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { id: 'klaviyo', label: 'Klaviyo' },
                              { id: 'hubspot', label: 'HubSpot' },
                              { id: 'activecampaign', label: 'ActiveCampaign' },
                              { id: 'mailchimp', label: 'Mailchimp' },
                              { id: 'brevo', label: 'Brevo' },
                              { id: 'marketo-engage', label: 'Marketo Engage' },
                              { id: 'pardot', label: 'Pardot' },
                              { id: 'custom', label: 'Add custom platform' }
                            ].map((platform) => (
                              <FormItem key={platform.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={crmIntegration.selectedMarketingAutomation.includes(platform.id as any)}
                                    onCheckedChange={(checked) => {
                                      const updatedPlatforms = checked
                                        ? [...crmIntegration.selectedMarketingAutomation, platform.id as any]
                                        : crmIntegration.selectedMarketingAutomation.filter(id => id !== platform.id);
                                      setCrmIntegration(prev => ({ ...prev, selectedMarketingAutomation: updatedPlatforms }));
                                      crmForm.setValue('selectedMarketingAutomation', updatedPlatforms);
                                    }}
                                    data-testid={`checkbox-marketing-${platform.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {platform.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {crmIntegration.selectedMarketingAutomation.includes('custom') && (
                      <FormField
                        control={crmForm.control}
                        name="customMarketingAutomationNames"
                        render={() => (
                          <FormItem className="mt-6">
                            <FormLabel>Custom Marketing Automation Names</FormLabel>
                            <FormDescription>
                              Enter the names of your custom marketing automation platforms (one per line)
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="Enter custom marketing automation names, one per line"
                                value={(crmIntegration.customMarketingAutomationNames || []).join('\n')}
                                onChange={(e) => {
                                  const lines = e.target.value.split('\n');
                                  setCrmIntegration(prev => ({ ...prev, customMarketingAutomationNames: lines }));
                                  crmForm.setValue('customMarketingAutomationNames', lines);
                                }}
                                data-testid="textarea-custom-marketing-names"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="border-t pt-6 mt-6">
                      <FormField
                        control={crmForm.control}
                        name="selectedPaymentGateways"
                        render={() => (
                          <FormItem>
                            <FormLabel>Payment Gateways</FormLabel>
                            <FormDescription className="mb-4">
                              Select all payment gateways you want to integrate with
                            </FormDescription>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'stripe', label: 'Stripe' },
                                { id: 'paypal', label: 'PayPal' },
                                { id: 'square', label: 'Square' },
                                { id: 'authorize-net', label: 'Authorize.net' },
                                { id: 'amazon-pay', label: 'Amazon Pay' },
                                { id: 'apple-pay', label: 'Apple Pay' },
                                { id: 'bank-transfer', label: 'Bank Transfer' },
                                { id: 'custom', label: 'Add custom gateway' }
                              ].map((gateway) => (
                                <FormItem key={gateway.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={crmIntegration.selectedPaymentGateways.includes(gateway.id as any)}
                                      onCheckedChange={(checked) => {
                                        const updatedGateways = checked
                                          ? [...crmIntegration.selectedPaymentGateways, gateway.id as any]
                                          : crmIntegration.selectedPaymentGateways.filter(id => id !== gateway.id);
                                        setCrmIntegration(prev => ({ ...prev, selectedPaymentGateways: updatedGateways }));
                                        crmForm.setValue('selectedPaymentGateways', updatedGateways);
                                      }}
                                      data-testid={`checkbox-payment-${gateway.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {gateway.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {crmIntegration.selectedPaymentGateways.includes('custom') && (
                        <FormField
                          control={crmForm.control}
                          name="customPaymentGatewayNames"
                          render={() => (
                            <FormItem className="mt-6">
                              <FormLabel>Custom Payment Gateway Names</FormLabel>
                              <FormDescription>
                                Enter the names of your custom payment gateways (one per line)
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter custom payment gateway names, one per line"
                                  value={(crmIntegration.customPaymentGatewayNames || []).join('\n')}
                                  onChange={(e) => {
                                    const lines = e.target.value.split('\n');
                                    setCrmIntegration(prev => ({ ...prev, customPaymentGatewayNames: lines }));
                                    crmForm.setValue('customPaymentGatewayNames', lines);
                                  }}
                                  data-testid="textarea-custom-payment-names"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="border-t pt-6 mt-6">
                      <FormField
                        control={crmForm.control}
                        name="apiIntegrations"
                        render={() => (
                          <FormItem>
                            <FormLabel>API Integrations</FormLabel>
                            <FormDescription>
                              Describe any specific API integrations you need for your website
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Google Analytics, Facebook Pixel, Slack notifications, custom REST APIs, third-party services..."
                                value={crmIntegration.apiIntegrations || ''}
                                onChange={(e) => {
                                  setCrmIntegration(prev => ({ ...prev, apiIntegrations: e.target.value }));
                                  crmForm.setValue('apiIntegrations', e.target.value);
                                }}
                                data-testid="textarea-api-integrations"
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border-t pt-6 mt-6">
                      <FormField
                        control={crmForm.control}
                        name="selectedAutomationPlatforms"
                        render={() => (
                          <FormItem>
                            <FormLabel>Automation Platforms</FormLabel>
                            <FormDescription className="mb-4">
                              Select automation platforms you want to integrate with
                            </FormDescription>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'zapier', label: 'Zapier' },
                                { id: 'make', label: 'Make (formerly Integromat)' }
                              ].map((platform) => (
                                <FormItem key={platform.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={crmIntegration.selectedAutomationPlatforms.includes(platform.id as any)}
                                      onCheckedChange={(checked) => {
                                        const updatedPlatforms = checked
                                          ? [...crmIntegration.selectedAutomationPlatforms, platform.id as any]
                                          : crmIntegration.selectedAutomationPlatforms.filter(id => id !== platform.id);
                                        setCrmIntegration(prev => ({ ...prev, selectedAutomationPlatforms: updatedPlatforms }));
                                        crmForm.setValue('selectedAutomationPlatforms', updatedPlatforms);
                                      }}
                                      data-testid={`checkbox-automation-${platform.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {platform.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="border-t pt-6 mt-6">
                      <FormField
                        control={crmForm.control}
                        name="selectedEngagementFeatures"
                        render={() => (
                          <FormItem>
                            <FormLabel>Engagement & Interactivity</FormLabel>
                            <FormDescription className="mb-4">
                              Select engagement and interactive features you want to integrate
                            </FormDescription>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'animations-motion-effects', label: 'Animations & Motion Effects' },
                                { id: 'popups-modals', label: 'Pop-ups / Modals (newsletter, promos)' },
                                { id: 'live-chat-integration', label: 'Live Chat Integration (Intercom, Drift, etc.)' },
                                { id: 'polls-surveys', label: 'Polls & Surveys' },
                                { id: 'appointment-booking-scheduling', label: 'Appointment Booking / Scheduling' },
                                { id: 'event-calendar-ticketing', label: 'Event Calendar & Ticketing' },
                                { id: 'social-media-feeds-sharing', label: 'Social Media Feeds / Sharing' }
                              ].map((feature) => (
                                <FormItem key={feature.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={crmIntegration.selectedEngagementFeatures.includes(feature.id as any)}
                                      onCheckedChange={(checked) => {
                                        const updatedFeatures = checked
                                          ? [...crmIntegration.selectedEngagementFeatures, feature.id as any]
                                          : crmIntegration.selectedEngagementFeatures.filter(id => id !== feature.id);
                                        setCrmIntegration(prev => ({ ...prev, selectedEngagementFeatures: updatedFeatures }));
                                        crmForm.setValue('selectedEngagementFeatures', updatedFeatures);
                                      }}
                                      data-testid={`checkbox-engagement-${feature.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {feature.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Advanced Features Separator */}
                    <div className="border-t pt-6">
                      <FormField
                        control={crmForm.control}
                        name="selectedAdvancedFeatures"
                        render={() => (
                          <FormItem>
                            <FormLabel>Advanced Features</FormLabel>
                            <FormDescription className="mb-4">
                              Select advanced technical features and capabilities for your website
                            </FormDescription>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'multilingual-translation-support', label: 'Multilingual / Translation Support' },
                                { id: 'seo-tools-meta-sitemap-schema', label: 'SEO Tools (meta tags, sitemap, schema)' },
                                { id: 'analytics-integration-ga4-hotjar', label: 'Analytics Integration (GA4, Hotjar, etc.)' },
                                { id: 'security-features-ssl-captcha-2fa', label: 'Security Features (SSL, Captcha, 2FA)' },
                                { id: 'custom-forms-workflows', label: 'Custom Forms & Workflows' },
                                { id: 'chatbots-ai-powered-scripted', label: 'Chatbots (AI-powered or scripted)' }
                              ].map((feature) => (
                                <FormItem key={feature.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={crmIntegration.selectedAdvancedFeatures?.includes(feature.id as any) || false}
                                      onCheckedChange={(checked) => {
                                        const currentFeatures = crmIntegration.selectedAdvancedFeatures || [];
                                        const updatedFeatures = checked
                                          ? [...currentFeatures, feature.id as any]
                                          : currentFeatures.filter(id => id !== feature.id);
                                        setCrmIntegration(prev => ({ ...prev, selectedAdvancedFeatures: updatedFeatures }));
                                        crmForm.setValue('selectedAdvancedFeatures', updatedFeatures);
                                      }}
                                      data-testid={`checkbox-advanced-${feature.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {feature.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* E-Commerce Separator */}
                    <div className="border-t pt-6">
                      <FormField
                        control={crmForm.control}
                        name="selectedECommerceFeatures"
                        render={() => (
                          <FormItem>
                            <FormLabel>E-Commerce</FormLabel>
                            <FormDescription className="mb-4">
                              Select e-commerce features and functionality for your online store
                            </FormDescription>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: 'online-store-shopify-woocommerce', label: 'Online Store (Shopify / WooCommerce)' },
                                { id: 'product-catalog', label: 'Product Catalog' },
                                { id: 'shopping-cart-checkout', label: 'Shopping Cart & Checkout' },
                                { id: 'digital-downloads', label: 'Digital Downloads' },
                                { id: 'inventory-management', label: 'Inventory Management' },
                                { id: 'subscription-products', label: 'Subscription Products' },
                                { id: 'multi-currency-support', label: 'Multi-Currency Support' },
                                { id: 'discount-codes-coupons', label: 'Discount Codes / Coupons' }
                              ].map((feature) => (
                                <FormItem key={feature.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={crmIntegration.selectedECommerceFeatures?.includes(feature.id as any) || false}
                                      onCheckedChange={(checked) => {
                                        const currentFeatures = crmIntegration.selectedECommerceFeatures || [];
                                        const updatedFeatures = checked
                                          ? [...currentFeatures, feature.id as any]
                                          : currentFeatures.filter(id => id !== feature.id);
                                        setCrmIntegration(prev => ({ ...prev, selectedECommerceFeatures: updatedFeatures }));
                                        crmForm.setValue('selectedECommerceFeatures', updatedFeatures);
                                      }}
                                      data-testid={`checkbox-ecommerce-${feature.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {feature.label}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Accounts & Membership</CardTitle>
              <p className="text-muted-foreground">
                Configure user account and membership features for your website.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...membershipForm}>
                <form onSubmit={membershipForm.handleSubmit(onMembershipSubmit)} className="space-y-6">
                  
                  {/* Registration & Login */}
                  <FormField
                    control={membershipForm.control}
                    name="registrationLogin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={(checked) => {
                              const boolValue = checked === true;
                              field.onChange(boolValue);
                              setUserAccountsMembership(prev => ({ ...prev, registrationLogin: boolValue }));
                              membershipForm.setValue("registrationLogin", boolValue);
                            }}
                            data-testid="checkbox-registration-login"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            User Registration & Login
                          </FormLabel>
                          <FormDescription>
                            Allow users to create accounts and log in to your website
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* User Dashboard */}
                  <div className="space-y-4">
                    <FormField
                      control={membershipForm.control}
                      name="userDashboardNeeded"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                const boolValue = checked === true;
                                field.onChange(boolValue);
                                setUserAccountsMembership(prev => ({ ...prev, userDashboardNeeded: boolValue }));
                                membershipForm.setValue("userDashboardNeeded", boolValue);
                              }}
                              data-testid="checkbox-user-dashboard"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              User Dashboard Required
                            </FormLabel>
                            <FormDescription>
                              Provide users with a personalized dashboard area
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {userAccountsMembership.userDashboardNeeded && (
                      <FormField
                        control={membershipForm.control}
                        name="userDashboardFeatures"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dashboard Features & Functionality</FormLabel>
                            <FormDescription>
                              Describe what features and information users should see in their dashboard
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Profile management, order history, download center, account settings, notification preferences, usage analytics, subscription management..."
                                rows={4}
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setUserAccountsMembership(prev => ({ ...prev, userDashboardFeatures: e.target.value }));
                                }}
                                data-testid="textarea-dashboard-features"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Predefined Roles */}
                  <FormField
                    control={membershipForm.control}
                    name="predefinedRoles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Predefined User Roles</FormLabel>
                        <FormDescription>
                          Select the standard user roles that will be available on your website
                        </FormDescription>
                        <div className="flex gap-4">
                          {(['admin', 'member', 'guest'] as const).map((role) => (
                            <FormItem key={role} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, role]);
                                    } else {
                                      field.onChange(currentValue.filter((v) => v !== role));
                                    }
                                  }}
                                  data-testid={`checkbox-role-${role}`}
                                />
                              </FormControl>
                              <FormLabel className="capitalize">
                                {role}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom Roles */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Custom User Roles</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add custom roles specific to your organization with detailed descriptions
                      </p>
                    </div>
                    
                    {userAccountsMembership.customRoles.map((role, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-medium">Custom Role {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCustomRoles = userAccountsMembership.customRoles.filter((_, i) => i !== index);
                              setUserAccountsMembership(prev => ({ ...prev, customRoles: newCustomRoles }));
                              membershipForm.setValue("customRoles", newCustomRoles);
                            }}
                            data-testid={`button-remove-custom-role-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid gap-3">
                          <div>
                            <Label htmlFor={`custom-role-name-${index}`}>Role Name</Label>
                            <Input
                              id={`custom-role-name-${index}`}
                              placeholder="e.g., Editor, Moderator, Supervisor"
                              value={role.name}
                              onChange={(e) => {
                                const newCustomRoles = [...userAccountsMembership.customRoles];
                                newCustomRoles[index] = { ...role, name: e.target.value };
                                setUserAccountsMembership(prev => ({ ...prev, customRoles: newCustomRoles }));
                                membershipForm.setValue("customRoles", newCustomRoles);
                              }}
                              data-testid={`input-custom-role-name-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`custom-role-description-${index}`}>Role Description & Responsibilities</Label>
                            <Textarea
                              id={`custom-role-description-${index}`}
                              placeholder="Describe what this role can do, their responsibilities, and any special permissions..."
                              rows={3}
                              value={role.description || ''}
                              onChange={(e) => {
                                const newCustomRoles = [...userAccountsMembership.customRoles];
                                newCustomRoles[index] = { ...role, description: e.target.value };
                                setUserAccountsMembership(prev => ({ ...prev, customRoles: newCustomRoles }));
                                membershipForm.setValue("customRoles", newCustomRoles);
                              }}
                              data-testid={`textarea-custom-role-description-${index}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newCustomRole = { name: '', description: '' };
                        const newCustomRoles = [...userAccountsMembership.customRoles, newCustomRole];
                        setUserAccountsMembership(prev => ({ ...prev, customRoles: newCustomRoles }));
                        membershipForm.setValue("customRoles", newCustomRoles);
                      }}
                      data-testid="button-add-custom-role"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Role
                    </Button>
                  </div>

                  {/* Membership/Subscription System */}
                  <FormField
                    control={membershipForm.control}
                    name="membershipSubscriptionSystem"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-membership-subscription"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Membership / Subscription System</FormLabel>
                          <FormDescription>
                            Enable paid memberships or subscription features
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Membership Details - Only show if Membership/Subscription is enabled */}
                  {membershipForm.watch("membershipSubscriptionSystem") && (
                    <FormField
                      control={membershipForm.control}
                      name="membershipDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Details</FormLabel>
                          <FormDescription>
                            Provide details about your membership or subscription offerings
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your membership tiers, pricing, benefits, subscription duration, payment frequency, etc..."
                              {...field}
                              rows={5}
                              data-testid="textarea-membership-details"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case 9:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Images & Media</CardTitle>
              <p className="text-muted-foreground">
                Help us understand your image needs and preferences for your website.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Logo Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Logo Requirements</h3>
                <div className="grid gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Do you have a logo or need one created?</label>
                    <div className="grid gap-3">
                      {[
                        { value: 'have-logo', label: 'I have a logo already', desc: 'Upload your existing logo files' },
                        { value: 'need-logo', label: 'I need a logo designed', desc: 'We\'ll create a professional logo for you' },
                        { value: 'need-variations', label: 'I have a logo but need variations', desc: 'Existing logo with additional formats/versions' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover-elevate">
                          <input
                            type="radio"
                            name="logoNeeds"
                            value={option.value}
                            checked={imageRequirements.logoNeeds === option.value}
                            onChange={(e) => setImageRequirements(prev => ({ 
                              ...prev, 
                              logoNeeds: e.target.value as any 
                            }))}
                            className="mt-1"
                            data-testid={`radio-logo-needs-${option.value}`}
                          />
                          <div>
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {imageRequirements.logoNeeds === 'need-logo' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Logo Description (Optional)
                      </label>
                      <Textarea
                        placeholder="Describe your logo vision, preferred colors, symbols, or style"
                        value={imageRequirements.logoDescription || ''}
                        onChange={(e) => setImageRequirements(prev => ({ 
                          ...prev, 
                          logoDescription: e.target.value 
                        }))}
                        className="min-h-[80px]"
                        data-testid="textarea-logo-description"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Specific Image Needs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What Types of Photos Do You Need?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'teamPhotos', label: 'Team/Staff Photos', desc: 'Professional headshots or team group photos' },
                    { key: 'productPhotos', label: 'Product Photos', desc: 'High-quality images of your products/services' },
                    { key: 'facilityPhotos', label: 'Location/Facility Photos', desc: 'Images of your office, store, or workspace' }
                  ].map((photoType) => (
                    <label key={photoType.key} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover-elevate">
                      <Checkbox
                        checked={imageRequirements[photoType.key as keyof ImageRequirements] as boolean}
                        onCheckedChange={(checked) => setImageRequirements(prev => ({ 
                          ...prev, 
                          [photoType.key]: checked 
                        }))}
                        data-testid={`checkbox-${photoType.key}`}
                      />
                      <div>
                        <div className="font-medium text-sm">{photoType.label}</div>
                        <div className="text-xs text-muted-foreground">{photoType.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Specific Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Other Specific Images Needed</h3>
                <Textarea
                  placeholder="List any other specific images you need (e.g., 'photos of our manufacturing process', 'before/after examples', 'event photos')"
                  value={imageRequirements.specificImages?.join('\n') || ''}
                  onChange={(e) => setImageRequirements(prev => ({ 
                    ...prev, 
                    specificImages: e.target.value.split('\n').filter(line => line.trim()) 
                  }))}
                  className="min-h-[100px]"
                  data-testid="textarea-specific-images"
                />
              </div>

              {/* Photo Style Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photo Style Preference</h3>
                <div className="grid gap-3">
                  {[
                    { value: 'professional-corporate', label: 'Professional Corporate', desc: 'Clean, polished, business-focused imagery' },
                    { value: 'lifestyle-candid', label: 'Lifestyle & Candid', desc: 'Natural, authentic, everyday moments' },
                    { value: 'modern-minimalist', label: 'Modern Minimalist', desc: 'Clean, simple, lots of white space' },
                    { value: 'warm-friendly', label: 'Warm & Friendly', desc: 'Inviting, approachable, community-focused' },
                    { value: 'high-energy', label: 'High Energy', desc: 'Dynamic, action-oriented, vibrant' },
                    { value: 'artistic-creative', label: 'Artistic & Creative', desc: 'Unique angles, creative composition, artistic flair' }
                  ].map((style) => (
                    <label key={style.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover-elevate">
                      <input
                        type="radio"
                        name="photoStyle"
                        value={style.value}
                        checked={imageRequirements.preferredPhotoStyle === style.value}
                        onChange={(e) => setImageRequirements(prev => ({ 
                          ...prev, 
                          preferredPhotoStyle: e.target.value as any 
                        }))}
                        className="mt-1"
                        data-testid={`radio-photo-style-${style.value}`}
                      />
                      <div>
                        <div className="font-medium text-sm">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Photography Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stock Photography Options</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    For any images you don't provide, we can source professional stock photography:
                  </p>
                  <div className="grid gap-3">
                    {[
                      { value: 'free-library', label: 'Free Stock Library', desc: 'High-quality free images (limited selection)' },
                      { value: 'premium-paid', label: 'Premium Paid Stock', desc: 'Extensive professional library (higher cost)' },
                      { value: 'mixed', label: 'Mixed Approach', desc: 'Free where possible, premium for key images' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 p-3 bg-background border rounded-lg cursor-pointer hover-elevate">
                        <input
                          type="radio"
                          name="stockPhotoPreference"
                          value={option.value}
                          checked={imageRequirements.stockPhotoPreference === option.value}
                          onChange={(e) => setImageRequirements(prev => ({ 
                            ...prev, 
                            stockPhotoPreference: e.target.value as any 
                          }))}
                          className="mt-1"
                          data-testid={`radio-stock-preference-${option.value}`}
                        />
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Types Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Website Photo Types Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Here are the common types of photos used on professional websites:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { type: 'Hero Images', desc: 'Large banner images that make a strong first impression' },
                      { type: 'Product/Service Shots', desc: 'Showcase what you offer with clear, detailed imagery' },
                      { type: 'Team Photos', desc: 'Build trust with professional headshots and team pictures' },
                      { type: 'Process/Behind-the-Scenes', desc: 'Show how you work and what makes you unique' },
                      { type: 'Testimonial Support', desc: 'Images that accompany customer reviews and success stories' },
                      { type: 'Background/Texture Images', desc: 'Subtle patterns or textures that enhance design elements' }
                    ].map((photoInfo) => (
                      <div key={photoInfo.type} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-sm">{photoInfo.type}</div>
                          <div className="text-xs text-muted-foreground">{photoInfo.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Your Images</h3>
                <p className="text-sm text-muted-foreground">
                  Upload any logos, photos, or other media files you already have. You can select multiple files at once.
                </p>
                <FileUpload
                  multiple={true}
                  onFilesSelect={(files) => {
                    setMediaFiles(prev => [...prev, ...files]);
                    console.log('Media files uploaded:', files.map(f => f.name));
                    toast({
                      title: "Files Uploaded",
                      description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully.`
                    });
                  }}
                  onFileRemoveAt={(index) => {
                    setMediaFiles(prev => {
                      const removedFile = prev[index];
                      const updatedFiles = prev.filter((_, i) => i !== index);
                      console.log('Media file removed:', removedFile?.name);
                      toast({
                        title: "File Removed",
                        description: `${removedFile?.name} has been removed.`
                      });
                      return updatedFiles;
                    });
                  }}
                  currentFiles={mediaFiles}
                  acceptedTypes="image/*,video/*"
                  maxSize={50}
                  placeholder="Upload logos, photos, videos, or other media files"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Notes</h3>
                <Textarea
                  placeholder="Any other image-related requirements, preferences, or special considerations"
                  value={imageRequirements.additionalNotes || ''}
                  onChange={(e) => setImageRequirements(prev => ({ 
                    ...prev, 
                    additionalNotes: e.target.value 
                  }))}
                  className="min-h-[80px]"
                  data-testid="textarea-additional-notes"
                />
              </div>

            </CardContent>
          </Card>
        );

      case 10:
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

      case 11:
        // Extract colors from individual color selections, design notes, or defaults based on design style
        const extractColorsFromPreferences = (notes: string, preferences: DesignPreferences): string[] => {
          // First priority: Individual color selections
          const individualColors = [
            preferences.primaryColor,
            preferences.secondaryColor,
            preferences.accentColor
          ].filter((color): color is string => Boolean(color && color.trim() && color !== ""));
          
          if (individualColors.length > 0) {
            return individualColors.slice(0, 3); // Return up to 3 colors
          }
          const colorKeywords = {
            'forest green': '#228B22',
            'green': '#10B981',
            'blue': '#3B82F6',
            'red': '#EF4444',
            'purple': '#8B5CF6',
            'orange': '#F97316',
            'yellow': '#EAB308',
            'pink': '#EC4899',
            'teal': '#14B8A6',
            'indigo': '#6366F1',
            'grey': '#6B7280',
            'gray': '#6B7280',
            'black': '#1F2937',
            'white': '#F9FAFB'
          };
          
          const foundColors: string[] = [];
          const notesLower = notes.toLowerCase();
          
          // Check for color keywords in notes
          Object.entries(colorKeywords).forEach(([keyword, hex]) => {
            if (notesLower.includes(keyword)) {
              foundColors.push(hex);
            }
          });
          
          // If forest green specifically mentioned, prioritize it
          if (notesLower.includes('forest green')) {
            return ['#228B22', '#2F7D32']; // Forest green variations
          }
          
          // If grey/gray specifically mentioned, prioritize it
          if (notesLower.includes('grey') || notesLower.includes('gray')) {
            return ['#6B7280', '#4B5563']; // Grey variations
          }
          
          // Return found colors or style-based defaults
          if (foundColors.length > 0) {
            return foundColors.slice(0, 2); // Max 2 colors
          }
          
          // Default colors based on design style
          switch (designPreferences.selectedStyle) {
            case 'luxury': return ['#1F2937', '#D4AF37'];
            case 'tech': return ['#3B82F6', '#6366F1'];
            case 'creative': return ['#EC4899', '#8B5CF6'];
            case 'corporate': return ['#1F2937', '#3B82F6'];
            default: return ['#3B82F6', '#10B981'];
          }
        };

        const briefData: CreativeBriefData = {
          fullName,
          email,
          contactNumber,
          businessName,
          businessDescription,
          logoFile: logoFile || undefined,
          logoDecision: logoDecision || undefined,
          selectedLogo: selectedLogo || undefined,
          colors: extractColorsFromPreferences(designPreferences.additionalNotes || '', designPreferences),
          primaryColor: designPreferences.primaryColor,
          secondaryColor: designPreferences.secondaryColor,
          accentColor: designPreferences.accentColor,
          backgroundColor: designPreferences.backgroundColor,
          textColor: designPreferences.textColor,
          fonts: designPreferences.preferredFont ? [designPreferences.preferredFont] : [],
          siteType: selectedSiteType,
          pages: pages.map(p => ({ name: p.name, path: p.path })),
          coreWebsiteFeatures,
          pageContent: {
            'Home': 'Welcome to ' + businessName + '. ' + businessDescription,
            'About': 'Learn more about our story and what drives us.',
            'Contact': 'Get in touch with us today.'
          },
          crmIntegration,
          userAccountsMembership,
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

  if (isProjectSubmitted) {
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
          {currentStep === 11 ? (
            <span>Ready to submit your creative brief</span>
          ) : (
            <span>
              {canProceed ? "Ready to continue" : "Please complete this step to continue"}
            </span>
          )}
        </div>
        
        {currentStep === 11 ? (
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
            onClick={() => nextStep()}
            disabled={!canProceed || isSavingProgress}
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