import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { websiteFeatures, type WebsiteFeatureCategory, type FeatureSelection } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Circle, Save, Star, AlertCircle } from "lucide-react";

interface FeatureSelectionProps {
  userId?: string;
  projectId?: string;
  onSaved?: (selection: FeatureSelection) => void;
}

type Priority = 'low' | 'medium' | 'high';

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityIcons = {
  low: Circle,
  medium: AlertCircle,
  high: Star
};

export default function FeatureSelection({ userId, projectId, onSaved }: FeatureSelectionProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priority, setPriority] = useState<{ [key: string]: Priority }>({});
  const [notes, setNotes] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing feature selection if available
  const { data: existingSelection, isLoading } = useQuery<any>({
    queryKey: ['/api/feature-selections/user', userId],
    enabled: !!userId
  });

  useEffect(() => {
    if (existingSelection) {
      setSelectedFeatures(existingSelection.selectedFeatures || []);
      setPriority(existingSelection.priority || {});
      setNotes(existingSelection.notes || '');
    }
  }, [existingSelection]);

  // Save feature selection mutation
  const saveFeatureSelection = useMutation({
    mutationFn: async (selection: FeatureSelection) => {
      let response: Response;
      
      if (existingSelection?.id) {
        response = await apiRequest('PUT', `/api/feature-selections/${existingSelection.id}`, selection);
      } else {
        response = await apiRequest('POST', '/api/feature-selections', {
          ...selection,
          userId,
          projectId
        });
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save feature selection');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-selections/user', userId] });
      toast({
        title: "Feature Selection Saved",
        description: "Your feature preferences have been successfully saved."
      });
      onSaved?.(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "There was an error saving your feature selection. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures(prev => [...prev, feature]);
    } else {
      setSelectedFeatures(prev => prev.filter(f => f !== feature));
      setPriority(prev => {
        const newPriority = { ...prev };
        delete newPriority[feature];
        return newPriority;
      });
    }
  };

  const handlePriorityChange = (feature: string, newPriority: Priority) => {
    setPriority(prev => ({
      ...prev,
      [feature]: newPriority
    }));
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    saveFeatureSelection.mutate({
      selectedFeatures,
      priority,
      notes: notes.trim() || undefined
    });
  };

  const getCategoryStats = (category: WebsiteFeatureCategory) => {
    const categoryFeatures = websiteFeatures[category];
    const selectedInCategory = categoryFeatures.filter(feature => selectedFeatures.includes(feature));
    return {
      total: categoryFeatures.length,
      selected: selectedInCategory.length
    };
  };

  const isFeatureSelected = (feature: string) => selectedFeatures.includes(feature);
  const isCategoryExpanded = (category: string) => expandedCategories.has(category);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="feature-selection-page">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold" data-testid="title-feature-selection">
          Website Feature Selection
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the features and functionalities you'd like to include on your website. 
          You can prioritize features and add notes to help us understand your needs better.
        </p>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Selection Summary</span>
          </CardTitle>
          <CardDescription>
            {selectedFeatures.length} features selected across {Object.keys(websiteFeatures).length} categories
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Feature Categories */}
      <div className="space-y-4">
        {(Object.keys(websiteFeatures) as WebsiteFeatureCategory[]).map((category) => {
          const stats = getCategoryStats(category);
          const isExpanded = isCategoryExpanded(category);
          
          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover-elevate"
                onClick={() => toggleCategoryExpansion(category)}
                data-testid={`category-header-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {stats.selected}/{stats.total} selected
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-toggle-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    {isExpanded ? '−' : '+'}
                  </Button>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {websiteFeatures[category].map((feature) => {
                      const isSelected = isFeatureSelected(feature);
                      const featurePriority = priority[feature];
                      const PriorityIcon = featurePriority ? priorityIcons[featurePriority] : Circle;
                      
                      return (
                        <div key={feature} className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`feature-${feature}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleFeatureToggle(feature, checked as boolean)}
                              data-testid={`checkbox-${feature.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                            />
                            <div className="flex-1 min-w-0">
                              <Label 
                                htmlFor={`feature-${feature}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {feature}
                              </Label>
                              {featurePriority && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <PriorityIcon className="w-3 h-3" />
                                  <Badge className={`text-xs ${priorityColors[featurePriority]}`}>
                                    {featurePriority} priority
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Priority Selection for Selected Features */}
                          {isSelected && (
                            <div className="ml-6 pl-2 border-l-2 border-muted">
                              <Label className="text-xs text-muted-foreground">Priority Level:</Label>
                              <RadioGroup
                                value={featurePriority || 'medium'}
                                onValueChange={(value) => handlePriorityChange(feature, value as Priority)}
                                className="flex space-x-4 mt-1"
                                data-testid={`priority-${feature.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="low" id={`${feature}-low`} />
                                  <Label htmlFor={`${feature}-low`} className="text-xs">Low</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="medium" id={`${feature}-medium`} />
                                  <Label htmlFor={`${feature}-medium`} className="text-xs">Medium</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem value="high" id={`${feature}-high`} />
                                  <Label htmlFor={`${feature}-high`} className="text-xs">High</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Share any specific requirements, questions, or additional context about your feature needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell us more about your specific needs or any features not listed above..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
            data-testid="textarea-notes"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={saveFeatureSelection.isPending || selectedFeatures.length === 0}
          className="min-w-[200px]"
          data-testid="button-save-features"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveFeatureSelection.isPending ? 'Saving...' : 'Save Feature Selection'}
        </Button>
      </div>

      {selectedFeatures.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Select at least one feature to save your preferences.
        </div>
      )}
    </div>
  );
}