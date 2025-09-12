import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  GripVertical, 
  Home, 
  FileText, 
  Users, 
  Mail,
  ShoppingBag,
  Briefcase
} from "lucide-react";

export interface Page {
  id: string;
  name: string;
  path: string;
  required: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SitemapBuilderProps {
  pages: Page[];
  onPagesUpdate: (pages: Page[]) => void;
  suggestedPages?: Page[];
  className?: string;
}

const pageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  about: Users,
  services: Briefcase,
  products: ShoppingBag,
  contact: Mail,
  blog: FileText
};

export default function SitemapBuilder({ 
  pages, 
  onPagesUpdate, 
  suggestedPages = [],
  className = "" 
}: SitemapBuilderProps) {
  const [newPageName, setNewPageName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const addPage = (page?: Page) => {
    if (page) {
      // Add suggested page
      const newPages = [...pages, page];
      onPagesUpdate(newPages);
      console.log('Added suggested page:', page.name);
    } else if (newPageName.trim()) {
      // Add custom page
      const newPage: Page = {
        id: Date.now().toString(),
        name: newPageName.trim(),
        path: `/${newPageName.trim().toLowerCase().replace(/\s+/g, '-')}`,
        required: false
      };
      const newPages = [...pages, newPage];
      onPagesUpdate(newPages);
      setNewPageName("");
      console.log('Added custom page:', newPage.name);
    }
  };

  const removePage = (pageId: string) => {
    const pageToRemove = pages.find(p => p.id === pageId);
    if (pageToRemove && !pageToRemove.required) {
      const newPages = pages.filter(p => p.id !== pageId);
      onPagesUpdate(newPages);
      console.log('Removed page:', pageToRemove.name);
    }
  };

  const availableSuggestions = suggestedPages.filter(
    suggestion => !pages.some(page => page.id === suggestion.id)
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Pages */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Your Website Pages</h3>
        <div className="space-y-3">
          {pages.map((page, index) => {
            const IconComponent = page.icon || pageIcons[page.name.toLowerCase()] || FileText;
            
            return (
              <Card key={page.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <IconComponent className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{page.name}</div>
                      <div className="text-sm text-muted-foreground">{page.path}</div>
                    </div>
                    {page.required && (
                      <Badge variant="outline" className="ml-2">Required</Badge>
                    )}
                  </div>
                  
                  {!page.required && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePage(page.id)}
                      data-testid={`button-remove-page-${page.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Custom Page */}
      <div>
        <h4 className="font-medium mb-3">Add Custom Page</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Page name (e.g., Portfolio, FAQ)"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPage()}
            data-testid="input-new-page"
          />
          <Button
            onClick={() => addPage()}
            disabled={!newPageName.trim()}
            data-testid="button-add-page"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Suggested Pages */}
      {availableSuggestions.length > 0 && showSuggestions && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Suggested Pages</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
              data-testid="button-hide-suggestions"
            >
              Hide
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableSuggestions.map((suggestion) => {
              const IconComponent = suggestion.icon || pageIcons[suggestion.name.toLowerCase()] || FileText;
              
              return (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  className="justify-start hover-elevate"
                  onClick={() => addPage(suggestion)}
                  data-testid={`button-add-suggested-${suggestion.id}`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {suggestion.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}