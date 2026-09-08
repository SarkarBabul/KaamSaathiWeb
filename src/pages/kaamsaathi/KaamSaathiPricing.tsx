import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, MessageCircle } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/first month",
    description: "Perfect to get started",
    badge: null,
    features: [
      "Add up to 5 Workers",
      "Attendance Tracking",
      "Wage Calculation",
      "Reports",
    ],
    cta: "Download Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Starter",
    price: "₹199",
    period: "/month",
    description: "Best for small teams",
    badge: "Most Popular",
    features: [
      "Add Worker",
      "Attendance Tracking",
      "Wage Calculation",
      "Reports",
    ],
    cta: "Start Starter Trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Standard",
    price: "₹349",
    period: "/month",
    description: "For growing businesses",
    badge: null,
    features: [
      "Add workers",
      "Attendance Tracking",
      "Wage Calculation",
      "Reports",
      "Priority support",
    ],
    cta: "Start Std Trial",
    ctaVariant: "outline" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large teams & companies",
    badge: null,
    features: [
      "Everything in Pro",
      "Multi-admin access",
      "Custom integrations",
      "Dedicated support",
      "On-premise option",
    ],
    cta: "Contact Us",
    ctaVariant: "outline" as const,
  },
];

export default function KaamSaathiPricing() {
  return (
    <div>
      <Helmet>
        <title>KaamSaathi Pricing — Free & Pro Plans for Contractors</title>
        <meta name="description" content="KaamSaathi pricing plans: free for up to 10 workers, Pro from ₹99/month. Simple, transparent pricing for labour attendance & management apps." />
      </Helmet>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Start free. Upgrade when you're ready.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <Card
                key={i}
                className={`border-border relative flex flex-col ${
                  plan.badge ? "border-2 border-primary shadow-lg scale-[1.02]" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Pricing FAQ</h2>
          <div className="space-y-6">
            {[
              { q: "Can I try before paying?", a: "Yes! The free plan lets you use KaamSaathi with up to 10 workers forever. No credit card needed." },
              { q: "Can I cancel anytime?", a: "Absolutely. There are no contracts or cancellation fees. Cancel from the app anytime." },
              { q: "How do I upgrade?", a: "Simply go to Plans in the app and select your preferred plan. Upgrade takes effect instantly." },
              { q: "Is there a yearly discount?", a: "Yes! Annual plans get 2 months free. Contact us for details." },
            ].map((item, i) => (
              <div key={i} className="bg-background rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Started for Free</h2>
          <p className="text-lg text-accent-foreground/90 mb-8">No credit card. No hassle. Just download and start.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://play.google.com/store/apps/details?id=com.KaamSaathi" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                <Download className="mr-2 h-5 w-5" /> Download App
              </Button>
            </a>
            <a href="https://wa.me/919997394773">
              <Button size="lg" variant="outline" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10">
                <MessageCircle className="mr-2 h-5 w-5" /> Talk on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}