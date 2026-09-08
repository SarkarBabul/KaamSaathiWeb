import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Mail, Phone, Download } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    items: [
      { q: "What is KaamSaathi?", a: "KaamSaathi is a lightweight Android app designed for contractors, small business owners, and field teams to easily track daily wage worker attendance." },
      { q: "How do I download the app?", a: "You can download the app directly from the Google Play Store. Click the 'Download App' button on the home page. The app is currently available for Android devices." },
      { q: "Is the app free?", a: "Yes! KaamSaathi has a free plan that supports up to 10 workers and 1 site. You can upgrade to Pro for unlimited access." },
      { q: "Do I need an internet connection?", a: "The app works offline for marking daily wage worker attendance. However, you need internet to sync data and access reports." },
    ],
  },
  {
    category: "Features & Usage",
    items: [
      { q: "How do I mark attendance?", a: "Simply open the app, select your site, and tap on a worker's name to mark their daily wage worker attendance." },
      { q: "Can I manage multiple sites?", a: "Yes! With the Pro plan, you can create and manage unlimited sites, each with its own set of daily wage workers." },
      { q: "Can I see attendance history?", a: "Yes. The free plan shows 7 days of daily wage worker attendance history. Pro plan gives you full unlimited history with export options." },
      { q: "How do I add workers?", a: "Go to the Employees section, tap 'Add Worker', enter their name and details, and they're ready to be tracked." },
    ],
  },
  {
    category: "Billing & Plans",
    items: [
      { q: "How much does the Pro plan cost?", a: "The Pro plan is ₹99/month. Annual plans are available with 2 months free." },
      { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from the app. There are no contracts or cancellation fees." },
      { q: "Is my payment information secure?", a: "Absolutely. We use industry-standard encryption for all payment processing." },
    ],
  },
  {
    category: "Technical Support",
    items: [
      { q: "The app is not working. What should I do?", a: "Try closing and reopening the app. If the issue persists, clear the app cache or reinstall. Contact us on WhatsApp for immediate help." },
      { q: "I lost my data. Can it be recovered?", a: "If you were logged in, your data is synced to the cloud and can be recovered. Contact support for assistance." },
      { q: "Which devices are supported?", a: "KaamSaathi currently works on Android 6.0 and above. iOS support is planned for the future." },
    ],
  },
];

export default function KaamSaathiFAQ() {
  return (
    <div>
      <Helmet>
        <title>KaamSaathi FAQ — Attendance App Help & Support</title>
        <meta name="description" content="Find answers to KaamSaathi app questions: free plan, Pro features, offline mode, multi-site support, payment tracking and more." />
      </Helmet>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">FAQ & Support</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Find answers to common questions or reach out to our team.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {faqs.map((section, i) => (
            <div key={i} className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">{section.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {section.items.map((item, j) => (
                  <AccordionItem key={j} value={`${i}-${j}`} className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="text-foreground hover:text-primary text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground">Our team is here to assist you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-border text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-4">Quick replies, usually within minutes</p>
                <a href="https://wa.me/919997394773">
                  <Button variant="outline" className="w-full">Chat Now</Button>
                </a>
              </CardContent>
            </Card>
            <Card className="border-border text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed support within 24 hours</p>
                <a href="mailto:info@kametgroup.com">
                  <Button variant="outline" className="w-full">Send Email</Button>
                </a>
              </CardContent>
            </Card>
            <Card className="border-border text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-sm text-muted-foreground mb-4">Mon–Sat, 10 AM – 6 PM IST</p>
                <a href="tel:+919997394773">
                  <Button variant="outline" className="w-full">Call Us</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-accent-foreground/90 mb-8">Download the app and simplify daily wage worker attendance today.</p>
          <a href="https://play.google.com/store/apps/details?id=com.KaamSaathi" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Download className="mr-2 h-5 w-5" /> Download App
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}