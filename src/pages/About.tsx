import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Award, Users, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/services-bg.jpg";

export default function About() {
  const values = [
    {
      icon: Award,
      title: "Quality First",
      description: "We deliver high-quality solutions that exceed expectations"
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Your success is our priority, always"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We use the latest technology to solve your problems"
    },
    {
      icon: Shield,
      title: "Reliability",
      description: "Dependable services you can trust"
    }
  ];

  const reasons = [
    "Simple and easy-to-use solutions",
    "Affordable pricing for small businesses",
    "Fast delivery and quick support",
    "Experienced team with proven results",
    "100% customer satisfaction guaranteed",
    "Continuous updates and improvements"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Our team" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Kamet</h1>
            <p className="text-lg text-primary-foreground/90">
              Your trusted partner for technology and digital marketing solutions
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Who We Are</h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={heroImage} 
                  alt="Kamet Team" 
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p className="text-lg leading-relaxed">
                  <strong className="text-foreground">Kamet</strong> is a technology and marketing solutions provider 
                  dedicated to helping small businesses and contractors succeed in the digital age. We understand the 
                  challenges faced by growing businesses and have built solutions specifically designed to address them.
                </p>
                <p className="text-lg leading-relaxed">
                  We help small businesses and contractors with easy-to-use mobile apps like <strong className="text-foreground">KaamSaathi</strong> and comprehensive digital 
                  marketing services. Our team combines technical expertise with creative marketing skills to deliver 
                  solutions that actually work for your business.
                </p>
                <p className="text-lg leading-relaxed">
                  Whether you need to manage your team's attendance with our KaamSaathi app or create stunning marketing materials, we're 
                  here to simplify your business operations and help you grow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To simplify business operations with smart digital tools that are accessible, 
                  affordable, and easy to use. We believe every small business deserves access to 
                  technology that helps them grow and succeed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 mb-6">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To empower every small business with technology and digital presence. We envision 
                  a future where every business owner has the tools they need to manage their 
                  operations efficiently and reach more customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Us?</h2>
              <p className="text-lg text-muted-foreground">
                Here's what makes us different
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-background border border-border">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-foreground">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}