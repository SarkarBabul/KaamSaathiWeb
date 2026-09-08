import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2,
  MessageCircle,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/home-hero.jpg";
import kaamsaathiImg from "@/assets/kaamsaathi-app.jpg";
import digitalMarketingImg from "@/assets/digital-marketing.jpg";
import fastDeliveryImg from "@/assets/fast-delivery.jpg";

export default function Home() {
  const features = [
    {
      image: kaamsaathiImg,
      title: "KaamSaathi App",
      description: "Simple attendance management for your workers and teams"
    },
    {
      image: digitalMarketingImg,
      title: "Digital Marketing",
      description: "Posters, banners, websites & reels for your business"
    },
    {
      image: fastDeliveryImg,
      title: "Fast Delivery",
      description: "Quick turnaround time for all your marketing needs"
    }
  ];

  const benefits = [
    "Easy to use mobile app for attendance tracking",
    "Professional digital marketing services",
    "Dedicated support team",
    "Affordable monthly packages",
    "Fast project delivery",
    "100% satisfaction guarantee"
  ];

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/91XXXXXXXXXX?text=Hello! I'm interested in your services.", "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Technology background" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Smart Solutions for Attendance & Digital Marketing
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              KaamSaathi App + Digital Marketing Services to grow your business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-base font-semibold"
                asChild
              >
                <Link to="/">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Download App
                </Link>
              </Button>
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Talk on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Kamet?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide complete digital solutions for your business growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                From tracking your team's attendance to creating stunning marketing materials, 
                we've got you covered with affordable and easy-to-use solutions.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button 
                  size="lg"
                  asChild
                >
                  <Link to="/kamet/contact">
                    Get Started Today
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">500+</h3>
                  <p className="text-muted-foreground">Happy Clients</p>
                </CardContent>
              </Card>
              <Card className="border-border mt-8">
                <CardContent className="p-6">
                  <TrendingUp className="h-10 w-10 text-accent mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">1000+</h3>
                  <p className="text-muted-foreground">Projects Done</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6">
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">24/7</h3>
                  <p className="text-muted-foreground">Support</p>
                </CardContent>
              </Card>
              <Card className="border-border mt-8">
                <CardContent className="p-6">
                  <DollarSign className="h-10 w-10 text-accent mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">Best</h3>
                  <p className="text-muted-foreground">Prices</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses using Kamet's solutions for attendance management 
            and digital marketing success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact on WhatsApp
            </Button>
            <Button 
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link to="/kamet/services">
                View Our Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}