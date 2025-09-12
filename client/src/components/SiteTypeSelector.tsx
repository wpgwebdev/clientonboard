import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  FileText, 
  Wrench, 
  BookOpen, 
  Calendar, 
  Layers 
} from "lucide-react";

export interface SiteType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

interface SiteTypeSelectorProps {
  selectedType?: string;
  onTypeSelect: (typeId: string) => void;
  className?: string;
}

const siteTypes: SiteType[] = [
  {
    id: "brochure",
    name: "Brochure Site",
    description: "Professional company website with key information",
    icon: FileText,
    features: ["About Us", "Services", "Contact", "Team"]
  },
  {
    id: "ecommerce",
    name: "Online Store",
    description: "Sell products or services online with payment processing",
    icon: Store,
    features: ["Product Catalog", "Shopping Cart", "Payment", "Orders"]
  },
  {
    id: "service",
    name: "Service Business",
    description: "Showcase services and generate leads",
    icon: Wrench,
    features: ["Services", "Portfolio", "Testimonials", "Quote Form"]
  },
  {
    id: "blog",
    name: "Blog/Content",
    description: "Share articles, news, and educational content",
    icon: BookOpen,
    features: ["Articles", "Categories", "Search", "Comments"]
  },
  {
    id: "booking",
    name: "Booking System",
    description: "Allow clients to book appointments or services",
    icon: Calendar,
    features: ["Calendar", "Appointments", "Payments", "Reminders"]
  },
  {
    id: "custom",
    name: "Custom Solution",
    description: "Unique requirements that need a tailored approach",
    icon: Layers,
    features: ["Custom Features", "Integrations", "Workflows", "Scalable"]
  }
];

export default function SiteTypeSelector({ 
  selectedType, 
  onTypeSelect, 
  className = "" 
}: SiteTypeSelectorProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {siteTypes.map((type) => {
        const IconComponent = type.icon;
        const isSelected = selectedType === type.id;
        
        return (
          <Card
            key={type.id}
            className={`p-6 cursor-pointer transition-all hover-elevate ${
              isSelected 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:shadow-md"
            }`}
            onClick={() => onTypeSelect(type.id)}
            data-testid={`card-site-type-${type.id}`}
          >
            <div className="flex flex-col items-start space-y-4">
              <div className={`p-3 rounded-lg ${
                isSelected ? "bg-primary/10" : "bg-muted"
              }`}>
                <IconComponent className={`w-6 h-6 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              
              <div className="space-y-2 w-full">
                <h3 className="font-semibold text-lg">{type.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {type.features.map((feature) => (
                  <Badge 
                    key={feature} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}