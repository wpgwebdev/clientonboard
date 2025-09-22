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
    selectedCrm: string;
    customCrmName?: string;
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
function formatCrmName(selectedCrm: string, customCrmName?: string): string {
  if (selectedCrm === 'custom' && customCrmName) {
    return customCrmName;
  }
  
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
  
  return crmDisplayNames[selectedCrm] || selectedCrm;
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
              {briefData.fonts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Fonts:</p>
                  <div className="flex flex-wrap gap-2">
                    {briefData.fonts.map((font, index) => (
                      <Badge key={index} variant="secondary">{font}</Badge>
                    ))}
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

            {/* CRM Integration */}
            {briefData.crmIntegration && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">CRM Integration</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditSection('integration')}
                    data-testid="button-edit-integration"
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-3">
                    <p className="text-sm font-medium">Selected CRM Platform</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCrmName(briefData.crmIntegration.selectedCrm, briefData.crmIntegration.customCrmName)}
                    </p>
                  </div>
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