import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  FileText,
  Palette,
  Globe
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  className?: string;
}

export default function LandingPage({ onGetStarted, onLogin, className = "" }: LandingPageProps) {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Assistance",
      description: "Get intelligent suggestions for content, design, and structure tailored to your business."
    },
    {
      icon: Clock,
      title: "15-Minute Process",
      description: "Complete the entire onboarding in just 15-20 minutes with our guided wizard."
    },
    {
      icon: FileText,
      title: "Complete Creative Brief",
      description: "Generate a comprehensive creative brief that covers all aspects of your website project."
    },
    {
      icon: CheckCircle,
      title: "Professional Results",
      description: "Ensure clear communication and expectations with our structured approach."
    }
  ];

  const steps = [
    {
      number: 1,
      icon: Users,
      title: "Business Identity",
      description: "Tell us about your business, goals, and target audience."
    },
    {
      number: 2,
      icon: Palette,
      title: "Brand & Design",
      description: "Upload your logo and share your design preferences."
    },
    {
      number: 3,
      icon: Globe,
      title: "Website Strategy",
      description: "Define your site structure, content, and functionality needs."
    },
    {
      number: 4,
      icon: FileText,
      title: "Creative Brief",
      description: "Review and export your complete project brief."
    }
  ];

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">WebStudio Pro</span>
          </div>
          <Button variant="outline" onClick={onLogin} data-testid="button-login">
            Client Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Client Onboarding
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Start Your Website Project
            <span className="text-primary block mt-2">The Right Way</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Our comprehensive onboarding portal guides you through creating a complete creative brief, 
            ensuring your web design project starts with clear direction and professional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="gap-2"
              data-testid="button-get-started"
            >
              <Zap className="w-5 h-5" />
              Start Your Project
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => console.log('Learn more clicked')}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Onboarding Process?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've designed a streamlined process that captures everything we need to create your perfect website.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover-elevate">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Simple 4-Step Process</h2>
            <p className="text-lg text-muted-foreground">
              Follow our guided wizard to create a comprehensive creative brief in minutes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto mb-2">
                      {step.number}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses who have streamlined their web design process with our professional onboarding portal.
          </p>
          
          <Button 
            size="lg" 
            onClick={onGetStarted} 
            className="gap-2"
            data-testid="button-cta-start"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Creative Brief
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 WebStudio Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}