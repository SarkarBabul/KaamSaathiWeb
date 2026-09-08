import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import posterImg from "@/assets/service-poster.jpg";
import bannerImg from "@/assets/service-banner.jpg";
import websiteImg from "@/assets/service-website.jpg";
import reelsImg from "@/assets/service-reels.jpg";
import brandingImg from "@/assets/service-branding.jpg";

export default function Services() {
  const services = [
    {
      image: posterImg,
      title: "Poster Designing",
      description: "Eye-catching posters for your events, promotions, and announcements",
      features: [
        "Custom designs",
        "Print-ready files",
        "Multiple revisions",
        "Fast delivery"
      ]
    },
    {
      image: bannerImg,
      title: "Banner Designing",
      description: "Professional banners for both digital and print media",
      features: [
        "All sizes available",
        "High resolution",
        "Brand consistency",
        "Social media ready"
      ]
    },
    {
      image: websiteImg,
      title: "Website Designing",
      description: "Beautiful, responsive websites up to 8 pages",
      features: [
        "Mobile responsive",
        "Modern design",
        "Fast loading",
        "SEO friendly"
      ],
      price: "Starting ₹5,000"
    },
    {
      image: reelsImg,
      title: "Social Media Reels",
      description: "Engaging video content for Instagram and Facebook",
      features: [
        "Creative concepts",
        "Professional editing",
        "Trending formats",
        "Quick turnaround"
      ]
    },
    {
      image: brandingImg,
      title: "Branding & Logo Design",
      description: "Complete branding solutions for your business",
      features: [
        "Logo design",
        "Brand guidelines",
        "Color palette",
        "Typography selection"
      ]
    }
  ];

  const packages = [
    {
      name: "Starter Package",
      price: "Contact for pricing",
      features: [
        "5 Social media posts",
        "2 Banners",
        "Basic support"
      ]
    },
    {
      name: "Business Package",
      price: "Contact for pricing",
      features: [
        "15 Social media posts",
        "5 Banners",
        "2 Reels/month",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise Package",
      price: "Contact for pricing",
      features: [
        "Unlimited posts",
        "Unlimited banners",
        "5 Reels/month",
        "Website maintenance",
        "Dedicated support"
      ]
    }
  ];

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/91XXXXXXXXXX?text=Hello! I need a quote for digital marketing services.", "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Digital Marketing Services
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Affordable, Creative & Fast Delivery
            </p>
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Get a Free Quote on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete digital marketing solutions to help your business stand out
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {service.price && (
                    <p className="text-lg font-semibold text-accent">
                      {service.price}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Monthly Packages
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the perfect package for your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <Card 
                key={index} 
                className={`border-2 transition-all duration-300 hover:shadow-xl ${
                  pkg.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CardHeader>
                  {pkg.popular && (
                    <div className="text-center mb-2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-2xl text-center">{pkg.name}</CardTitle>
                  <p className="text-3xl font-bold text-center text-primary mt-4">
                    {pkg.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={handleWhatsAppClick}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Why Choose Our Digital Marketing Services?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Affordable pricing for small businesses",
                "Fast turnaround time",
                "Professional quality designs",
                "Unlimited revisions until satisfied",
                "Experienced creative team",
                "Dedicated project manager",
                "Regular updates on progress",
                "100% satisfaction guarantee"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Boost Your Brand?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Get started with our affordable digital marketing services today
          </p>
          <Button 
            size="lg"
            className="bg-background text-foreground hover:bg-background/90"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Request a Free Quote
          </Button>
        </div>
      </section>
    </div>
  );
}