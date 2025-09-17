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
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
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

  const updateColor = (colorType: keyof DesignPreferences, color: string) => {
    onPreferencesUpdate({
      ...preferences,
      [colorType]: color
    });
    console.log(`${colorType} updated:`, color);
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

      {/* Color Selection */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Choose Your Colors</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select custom colors for your website's color palette
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-sm font-medium">Primary Color</Label>
            <div className="flex items-center space-x-3">
              <input
                id="primary-color"
                type="color"
                value={preferences.primaryColor || "#3B82F6"}
                onChange={(e) => updateColor('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
                data-testid="input-primary-color"
              />
              <Input
                value={preferences.primaryColor || "#3B82F6"}
                onChange={(e) => updateColor('primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 font-mono text-sm"
                data-testid="input-primary-color-text"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondary-color" className="text-sm font-medium">Secondary Color</Label>
            <div className="flex items-center space-x-3">
              <input
                id="secondary-color"
                type="color"
                value={preferences.secondaryColor || "#1E40AF"}
                onChange={(e) => updateColor('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
                data-testid="input-secondary-color"
              />
              <Input
                value={preferences.secondaryColor || "#1E40AF"}
                onChange={(e) => updateColor('secondaryColor', e.target.value)}
                placeholder="#1E40AF"
                className="flex-1 font-mono text-sm"
                data-testid="input-secondary-color-text"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accent-color" className="text-sm font-medium">Accent Color</Label>
            <div className="flex items-center space-x-3">
              <input
                id="accent-color"
                type="color"
                value={preferences.accentColor || "#60A5FA"}
                onChange={(e) => updateColor('accentColor', e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
                data-testid="input-accent-color"
              />
              <Input
                value={preferences.accentColor || "#60A5FA"}
                onChange={(e) => updateColor('accentColor', e.target.value)}
                placeholder="#60A5FA"
                className="flex-1 font-mono text-sm"
                data-testid="input-accent-color-text"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background-color" className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center space-x-3">
              <input
                id="background-color"
                type="color"
                value={preferences.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateColor('backgroundColor', e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
                data-testid="input-background-color"
              />
              <Input
                value={preferences.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateColor('backgroundColor', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 font-mono text-sm"
                data-testid="input-background-color-text"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-color" className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center space-x-3">
              <input
                id="text-color"
                type="color"
                value={preferences.textColor || "#1F2937"}
                onChange={(e) => updateColor('textColor', e.target.value)}
                className="w-12 h-12 rounded-md border-2 border-border cursor-pointer"
                data-testid="input-text-color"
              />
              <Input
                value={preferences.textColor || "#1F2937"}
                onChange={(e) => updateColor('textColor', e.target.value)}
                placeholder="#1F2937"
                className="flex-1 font-mono text-sm"
                data-testid="input-text-color-text"
              />
            </div>
          </div>
        </div>
        
        {/* Color Preview */}
        <div className="mt-6">
          <Label className="text-sm font-medium mb-3 block">Color Preview</Label>
          <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
            <div 
              className="w-16 h-16 rounded-md border-2 border-border flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: preferences.primaryColor || "#3B82F6",
                color: preferences.textColor || "#1F2937"
              }}
            >
              Primary
            </div>
            <div 
              className="w-16 h-16 rounded-md border-2 border-border flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: preferences.secondaryColor || "#1E40AF",
                color: preferences.textColor || "#1F2937"
              }}
            >
              Secondary
            </div>
            <div 
              className="w-16 h-16 rounded-md border-2 border-border flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: preferences.accentColor || "#60A5FA",
                color: preferences.textColor || "#1F2937"
              }}
            >
              Accent
            </div>
            <div 
              className="w-16 h-16 rounded-md border-2 border-border flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: preferences.backgroundColor || "#FFFFFF",
                color: preferences.textColor || "#1F2937"
              }}
            >
              Background
            </div>
            <div 
              className="w-16 h-16 rounded-md border-2 border-border flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: preferences.textColor || "#1F2937",
                color: preferences.backgroundColor || "#FFFFFF"
              }}
            >
              Text
            </div>
          </div>
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