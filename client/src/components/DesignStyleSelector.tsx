import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ExternalLink } from "lucide-react";

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface DesignPreferences {
  selectedStyle?: string;
  colorTheme?: string;
  inspirationLinks: string[];
  additionalNotes: string;
}

interface DesignStyleSelectorProps {
  preferences: DesignPreferences;
  onPreferencesUpdate: (preferences: DesignPreferences) => void;
  className?: string;
}

const designStyles: DesignStyle[] = [
  {
    id: "modern",
    name: "Modern & Clean",
    description: "Minimalist design with clean lines and plenty of whitespace",
    characteristics: ["Minimalist", "Clean Typography", "Whitespace", "Simple"]
  },
  {
    id: "playful",
    name: "Playful & Creative",
    description: "Fun, colorful design with creative elements and animations",
    characteristics: ["Colorful", "Animations", "Creative", "Engaging"]
  },
  {
    id: "luxury",
    name: "Luxury & Elegant",
    description: "Sophisticated design with premium feel and high-end aesthetics",
    characteristics: ["Sophisticated", "Premium", "Elegant", "High-end"]
  },
  {
    id: "corporate",
    name: "Corporate & Professional",
    description: "Business-focused design that builds trust and credibility",
    characteristics: ["Professional", "Trustworthy", "Structured", "Business"]
  },
  {
    id: "creative",
    name: "Creative & Artistic",
    description: "Unique, artistic design that showcases creativity and innovation",
    characteristics: ["Unique", "Artistic", "Innovative", "Creative"]
  },
  {
    id: "tech",
    name: "Tech & Futuristic",
    description: "Modern tech-focused design with innovative elements",
    characteristics: ["Tech-focused", "Innovative", "Modern", "Digital"]
  }
];

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const colorThemes: ColorTheme[] = [
  {
    id: "blue-professional",
    name: "Professional Blue",
    description: "Classic blue scheme for business and corporate sites",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF", 
    accentColor: "#60A5FA"
  },
  {
    id: "green-nature",
    name: "Natural Green",
    description: "Fresh green palette for eco-friendly and health brands",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    accentColor: "#34D399"
  },
  {
    id: "purple-creative",
    name: "Creative Purple",
    description: "Modern purple scheme for creative and tech companies",
    primaryColor: "#8B5CF6",
    secondaryColor: "#7C3AED",
    accentColor: "#A78BFA"
  },
  {
    id: "orange-energetic",
    name: "Energetic Orange",
    description: "Vibrant orange palette for dynamic and friendly brands",
    primaryColor: "#F97316",
    secondaryColor: "#EA580C",
    accentColor: "#FB923C"
  },
  {
    id: "grey-minimal",
    name: "Minimal Grey",
    description: "Sophisticated grey scheme for minimalist designs",
    primaryColor: "#6B7280",
    secondaryColor: "#4B5563",
    accentColor: "#9CA3AF"
  },
  {
    id: "red-bold",
    name: "Bold Red",
    description: "Strong red palette for impactful and energetic brands",
    primaryColor: "#EF4444",
    secondaryColor: "#DC2626",
    accentColor: "#F87171"
  }
];

export default function DesignStyleSelector({ 
  preferences, 
  onPreferencesUpdate, 
  className = "" 
}: DesignStyleSelectorProps) {
  const [newLink, setNewLink] = useState("");

  const selectStyle = (styleId: string) => {
    onPreferencesUpdate({
      ...preferences,
      selectedStyle: styleId
    });
    console.log('Design style selected:', styleId);
  };

  const selectColorTheme = (themeId: string) => {
    onPreferencesUpdate({
      ...preferences,
      colorTheme: themeId
    });
    console.log('Color theme selected:', themeId);
  };

  const addInspirationLink = () => {
    if (newLink.trim()) {
      const updatedLinks = [...preferences.inspirationLinks, newLink.trim()];
      onPreferencesUpdate({
        ...preferences,
        inspirationLinks: updatedLinks
      });
      setNewLink("");
      console.log('Inspiration link added:', newLink.trim());
    }
  };

  const removeInspirationLink = (index: number) => {
    const updatedLinks = preferences.inspirationLinks.filter((_, i) => i !== index);
    onPreferencesUpdate({
      ...preferences,
      inspirationLinks: updatedLinks
    });
    console.log('Inspiration link removed at index:', index);
  };

  const updateNotes = (notes: string) => {
    onPreferencesUpdate({
      ...preferences,
      additionalNotes: notes
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Style Selection */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Choose Your Design Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designStyles.map((style) => {
            const isSelected = preferences.selectedStyle === style.id;
            
            return (
              <Card
                key={style.id}
                className={`p-6 cursor-pointer transition-all hover-elevate ${
                  isSelected 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:shadow-md"
                }`}
                onClick={() => selectStyle(style.id)}
                data-testid={`card-design-style-${style.id}`}
              >
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{style.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {style.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {style.characteristics.map((characteristic) => (
                      <Badge 
                        key={characteristic} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {characteristic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Color Theme Selection */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Choose Your Color Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorThemes.map((theme) => {
            const isSelected = preferences.colorTheme === theme.id;
            
            return (
              <Card
                key={theme.id}
                className={`p-6 cursor-pointer transition-all hover-elevate ${
                  isSelected 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:shadow-md"
                }`}
                onClick={() => selectColorTheme(theme.id)}
                data-testid={`card-color-theme-${theme.id}`}
              >
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">{theme.name}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>
                  
                  {/* Color Palette Preview */}
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                      style={{ backgroundColor: theme.primaryColor }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                      style={{ backgroundColor: theme.secondaryColor }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-8 h-8 rounded-md border-2 border-border flex-shrink-0" 
                      style={{ backgroundColor: theme.accentColor }}
                      title="Accent Color"
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Primary • Secondary • Accent
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Inspiration Links */}
      <div>
        <Label className="text-lg font-semibold">Inspiration Links</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Share websites you like to help us understand your visual preferences
        </p>
        
        <div className="space-y-3">
          {preferences.inspirationLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input 
                value={link} 
                readOnly 
                className="flex-1"
                data-testid={`text-inspiration-link-${index}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(link, '_blank')}
                data-testid={`button-open-link-${index}`}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeInspirationLink(index)}
                data-testid={`button-remove-link-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <Input
              placeholder="https://example.com"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInspirationLink()}
              data-testid="input-new-inspiration-link"
            />
            <Button
              onClick={addInspirationLink}
              disabled={!newLink.trim()}
              data-testid="button-add-inspiration-link"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes" className="text-lg font-semibold">Additional Design Notes</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Any specific design preferences, colors, or requirements we should know about?
        </p>
        <Textarea
          id="notes"
          placeholder="e.g., I prefer blue and green colors, need to match our existing brand guidelines, want a mobile-first approach..."
          value={preferences.additionalNotes}
          onChange={(e) => updateNotes(e.target.value)}
          rows={4}
          data-testid="textarea-design-notes"
        />
      </div>
    </div>
  );
}