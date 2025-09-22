import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Palette, 
  Globe, 
  FileText, 
  Images, 
  Sparkles,
  Download,
  ExternalLink
} from "lucide-react";

export interface CreativeBriefData {
  businessName: string;
  businessDescription: string;
  logoFile?: File;
  logoDecision?: 'final' | 'direction';
  selectedLogo?: {
    id: string;
    dataUrl: string;
    prompt: string;
  };
  colors: string[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fonts: string[];
  siteType: string;
  pages: { name: string; path: string }[];
  pageContent: Record<string, string>;
  crmIntegration?: {
    selectedCrms: string[];
    customCrmNames?: string[];
    selectedMarketingAutomation: string[];
    customMarketingAutomationNames?: string[];
    selectedPaymentGateways: string[];
    customPaymentGatewayNames?: string[];
    apiIntegrations?: string;
    selectedAutomationPlatforms: string[];
    selectedEngagementFeatures: string[];
  };
  images: File[];
  designStyle: string;
  inspirationLinks: string[];
  designNotes: string;
}

interface CreativeBriefReviewProps {
  briefData: CreativeBriefData;
  onExportPDF: () => void;
  onEditSection: (section: string) => void;
  className?: string;
}

// Helper function to format CRM names for display
function formatCrmNames(selectedCrms: string[], customCrmNames?: string[]): string[] {
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
  
  const formattedCrms: string[] = [];
  
  selectedCrms.forEach(crm => {
    if (crm === 'custom') {
      if (customCrmNames && customCrmNames.length > 0) {
        const filteredNames = customCrmNames.filter(name => name.trim());
        formattedCrms.push(...filteredNames);
      }
    } else {
      formattedCrms.push(crmDisplayNames[crm] || crm);
    }
  });
  
  return formattedCrms;
}

// Helper function to format Marketing Automation names for display
function formatMarketingAutomationNames(selectedPlatforms: string[], customNames?: string[]): string[] {
  const platformDisplayNames: Record<string, string> = {
    'klaviyo': 'Klaviyo',
    'hubspot': 'HubSpot',
    'activecampaign': 'ActiveCampaign',
    'mailchimp': 'Mailchimp',
    'brevo': 'Brevo',
    'marketo-engage': 'Marketo Engage',
    'pardot': 'Pardot'
  };
  
  const formattedPlatforms: string[] = [];
  
  selectedPlatforms.forEach(platform => {
    if (platform === 'custom') {
      if (customNames && customNames.length > 0) {
        const filteredNames = customNames.filter(name => name.trim());
        formattedPlatforms.push(...filteredNames);
      }
    } else {
      formattedPlatforms.push(platformDisplayNames[platform] || platform);
    }
  });
  
  return formattedPlatforms;
}

// Helper function to format Payment Gateway names for display
function formatPaymentGatewayNames(selectedGateways: string[], customNames?: string[]): string[] {
  const gatewayDisplayNames: Record<string, string> = {
    'stripe': 'Stripe',
    'paypal': 'PayPal',
    'square': 'Square',
    'authorize-net': 'Authorize.net',
    'amazon-pay': 'Amazon Pay',
    'apple-pay': 'Apple Pay',
    'bank-transfer': 'Bank Transfer'
  };
  
  const formattedGateways: string[] = [];
  
  selectedGateways.forEach(gateway => {
    if (gateway === 'custom') {
      if (customNames && customNames.length > 0) {
        const filteredNames = customNames.filter(name => name.trim());
        formattedGateways.push(...filteredNames);
      }
    } else {
      formattedGateways.push(gatewayDisplayNames[gateway] || gateway);
    }
  });
  
  return formattedGateways;
}

// Helper function to format Automation Platform names for display
function formatAutomationPlatformNames(selectedPlatforms: string[]): string[] {
  const platformDisplayNames: Record<string, string> = {
    'zapier': 'Zapier',
    'make': 'Make (formerly Integromat)'
  };
  
  return selectedPlatforms.map(platform => platformDisplayNames[platform] || platform);
}

// Helper function to format Engagement Feature names for display
function formatEngagementFeatureNames(selectedFeatures: string[]): string[] {
  const featureDisplayNames: Record<string, string> = {
    'animations-motion-effects': 'Animations & Motion Effects',
    'popups-modals': 'Pop-ups / Modals (newsletter, promos)',
    'live-chat-integration': 'Live Chat Integration (Intercom, Drift, etc.)',
    'polls-surveys': 'Polls & Surveys',
    'appointment-booking-scheduling': 'Appointment Booking / Scheduling',
    'event-calendar-ticketing': 'Event Calendar & Ticketing',
    'social-media-feeds-sharing': 'Social Media Feeds / Sharing'
  };
  
  return selectedFeatures.map(feature => featureDisplayNames[feature] || feature);
}

export default function CreativeBriefReview({ 
  briefData, 
  onExportPDF, 
  onEditSection,
  className = "" 
}: CreativeBriefReviewProps) {
  const formatSiteType = (type: string) => {
    const typeMap: Record<string, string> = {
      brochure: 'Brochure Site',
      ecommerce: 'Online Store',
      service: 'Service Business',
      blog: 'Blog/Content',
      booking: 'Booking System',
      custom: 'Custom Solution'
    };
    return typeMap[type] || type;
  };

  const formatDesignStyle = (style: string) => {
    const styleMap: Record<string, string> = {
      modern: 'Modern & Clean',
      playful: 'Playful & Creative',
      luxury: 'Luxury & Elegant',
      corporate: 'Corporate & Professional',
      creative: 'Creative & Artistic',
      tech: 'Tech & Futuristic'
    };
    return styleMap[style] || style;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Creative Brief Review</h2>
          <p className="text-muted-foreground mt-2">
            Review all the information collected for your website project
          </p>
        </div>
        <Button 
          onClick={onExportPDF}
          className="gap-2"
          data-testid="button-export-pdf"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Identity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Identity
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditSection('business')}
              data-testid="button-edit-business"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">{briefData.businessName}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {briefData.businessDescription}
                </p>
              </div>
              {(briefData.logoFile || briefData.selectedLogo) && (
                <div>
                  <p className="text-sm font-medium mb-2">Logo:</p>
                  {briefData.logoFile && (
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {briefData.logoFile.name}
                    </p>
                  )}
                  {briefData.selectedLogo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={briefData.selectedLogo.dataUrl} 
                          alt="Selected Logo" 
                          className="w-16 h-16 object-contain border rounded"
                        />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            AI Generated Logo
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={briefData.logoDecision === 'final' ? 'default' : 'secondary'}>
                              {briefData.logoDecision === 'final' ? 'Final Selection' : 'Creative Direction'}
                            </Badge>
                          </div>
                          {briefData.logoDecision === 'direction' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Client wants similar style - requires refinement
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Branding
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditSection('branding')}
              data-testid="button-edit-branding"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Color Scheme */}
              {(briefData.primaryColor || briefData.secondaryColor || briefData.accentColor || briefData.backgroundColor || briefData.textColor) && (
                <div>
                  <p className="text-sm font-medium mb-3">Selected Color Scheme:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {briefData.primaryColor && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                          style={{ backgroundColor: briefData.primaryColor }}
                        />
                        <div>
                          <span className="text-sm font-medium">Primary</span>
                          <p className="text-xs text-muted-foreground">{briefData.primaryColor}</p>
                        </div>
                      </div>
                    )}
                    {briefData.secondaryColor && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                          style={{ backgroundColor: briefData.secondaryColor }}
                        />
                        <div>
                          <span className="text-sm font-medium">Secondary</span>
                          <p className="text-xs text-muted-foreground">{briefData.secondaryColor}</p>
                        </div>
                      </div>
                    )}
                    {briefData.accentColor && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                          style={{ backgroundColor: briefData.accentColor }}
                        />
                        <div>
                          <span className="text-sm font-medium">Accent</span>
                          <p className="text-xs text-muted-foreground">{briefData.accentColor}</p>
                        </div>
                      </div>
                    )}
                    {briefData.backgroundColor && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                          style={{ backgroundColor: briefData.backgroundColor }}
                        />
                        <div>
                          <span className="text-sm font-medium">Background</span>
                          <p className="text-xs text-muted-foreground">{briefData.backgroundColor}</p>
                        </div>
                      </div>
                    )}
                    {briefData.textColor && (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                          style={{ backgroundColor: briefData.textColor }}
                        />
                        <div>
                          <span className="text-sm font-medium">Text</span>
                          <p className="text-xs text-muted-foreground">{briefData.textColor}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Selected Font */}
              {briefData.fonts && briefData.fonts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Selected Font:</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div 
                        className="text-lg font-semibold" 
                        style={{ fontFamily: briefData.fonts[0] }}
                        data-testid="text-selected-font"
                      >
                        {briefData.fonts[0]}
                      </div>
                      <p className="text-sm text-muted-foreground" style={{ fontFamily: briefData.fonts[0] }}>
                        Sample: The quick brown fox jumps over the lazy dog
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {briefData.fonts[0]}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Website Purpose */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Website Purpose
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditSection('purpose')}
              data-testid="button-edit-purpose"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div>
              <Badge variant="outline" className="mb-3">
                {formatSiteType(briefData.siteType)}
              </Badge>
              <div>
                <p className="text-sm font-medium mb-2">Pages ({briefData.pages.length}):</p>
                <div className="space-y-1">
                  {briefData.pages.slice(0, 6).map((page, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{page.name}</span>
                      <span className="text-muted-foreground">{page.path}</span>
                    </div>
                  ))}
                  {briefData.pages.length > 6 && (
                    <p className="text-sm text-muted-foreground">
                      +{briefData.pages.length - 6} more pages
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Style */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Design Style
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEditSection('design')}
              data-testid="button-edit-design"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge variant="outline">
                  {formatDesignStyle(briefData.designStyle)}
                </Badge>
              </div>
              
              {briefData.inspirationLinks.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Inspiration:</p>
                  <div className="space-y-1">
                    {briefData.inspirationLinks.slice(0, 3).map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ExternalLink className="w-3 h-3" />
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {link}
                        </a>
                      </div>
                    ))}
                    {briefData.inspirationLinks.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{briefData.inspirationLinks.length - 3} more links
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {briefData.designNotes && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {briefData.designNotes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content & Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Content & Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page Content */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Page Content</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection('content')}
                  data-testid="button-edit-content"
                >
                  Edit
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(briefData.pageContent).slice(0, 4).map(([pageName, content]) => (
                  <div key={pageName} className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-medium">{pageName}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content || 'Content pending...'}
                    </p>
                  </div>
                ))}
                {Object.keys(briefData.pageContent).length > 4 && (
                  <p className="text-sm text-muted-foreground">
                    +{Object.keys(briefData.pageContent).length - 4} more pages
                  </p>
                )}
              </div>
            </div>

            {/* Integrations */}
            {briefData.crmIntegration && (briefData.crmIntegration.selectedCrms?.length > 0 || briefData.crmIntegration.selectedMarketingAutomation?.length > 0 || briefData.crmIntegration.selectedPaymentGateways?.length > 0 || briefData.crmIntegration.apiIntegrations?.trim() || briefData.crmIntegration.selectedAutomationPlatforms?.length > 0 || briefData.crmIntegration.selectedEngagementFeatures?.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Integrations</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditSection('integration')}
                    data-testid="button-edit-integration"
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  {briefData.crmIntegration.selectedCrms?.length > 0 && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">CRM Platforms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formatCrmNames(briefData.crmIntegration.selectedCrms, briefData.crmIntegration.customCrmNames).map((crmName, index) => (
                          <Badge key={`crm-${index}`} variant="secondary" className="text-xs">
                            {crmName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {briefData.crmIntegration.selectedMarketingAutomation?.length > 0 && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">Marketing Automation Platforms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formatMarketingAutomationNames(briefData.crmIntegration.selectedMarketingAutomation, briefData.crmIntegration.customMarketingAutomationNames).map((platformName, index) => (
                          <Badge key={`marketing-${index}`} variant="outline" className="text-xs">
                            {platformName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {briefData.crmIntegration.selectedPaymentGateways?.length > 0 && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">Payment Gateways</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formatPaymentGatewayNames(briefData.crmIntegration.selectedPaymentGateways, briefData.crmIntegration.customPaymentGatewayNames).map((gatewayName, index) => (
                          <Badge key={`payment-${index}`} variant="default" className="text-xs">
                            {gatewayName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {briefData.crmIntegration.apiIntegrations?.trim() && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">API Integrations</p>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {briefData.crmIntegration.apiIntegrations}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {briefData.crmIntegration.selectedAutomationPlatforms?.length > 0 && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">Automation Platforms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formatAutomationPlatformNames(briefData.crmIntegration.selectedAutomationPlatforms).map((platformName, index) => (
                          <Badge key={`automation-${index}`} variant="destructive" className="text-xs">
                            {platformName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {briefData.crmIntegration.selectedEngagementFeatures?.length > 0 && (
                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">Engagement & Interactivity</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formatEngagementFeatureNames(briefData.crmIntegration.selectedEngagementFeatures).map((featureName, index) => (
                          <Badge key={`engagement-${index}`} className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {featureName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Images & Media</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection('media')}
                  data-testid="button-edit-media"
                >
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                {briefData.images.slice(0, 5).map((image, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Images className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{image.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
                {briefData.images.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{briefData.images.length - 5} more images
                  </p>
                )}
                {briefData.images.length === 0 && (
                  <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}