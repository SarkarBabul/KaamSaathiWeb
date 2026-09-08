import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Download, MessageCircle, CheckCircle2, ShieldCheck, Star, WifiOff, Users, ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import workflowBg from "@/assets/kaamsaathi-workflow.jpg";
import screenshotDashboard from "@/assets/screenshot-dashboard.webp";
import screenshotAttendance from "@/assets/screenshot-attendance.webp";
import screenshotEmployee from "@/assets/screenshot-employee.webp";
import screenshotEarnings from "@/assets/screenshot-earnings.webp";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.KaamSaathi";
const WHATSAPP_URL =
  "https://wa.me/919997394773?text=Hello!%20I%20want%20to%20know%20more%20about%20KaamSaathi%20app.";

export interface SeoLandingProps {
  slug: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
  };
  hero: {
    badge: string;
    h1: string;
    hindiSub: string;
    intro: string;
  };
  intro: { h2: string; paragraphs: string[] };
  problems: { h2: string; intro?: string; items: { icon: LucideIcon; title: string; desc: string }[] };
  features: { h2: string; intro?: string; items: { icon: LucideIcon; title: string; desc: string }[] };
  benefits: { h2: string; items: string[] };
  audience: { h2: string; items: { icon: LucideIcon; title: string; desc: string }[] };
  howItWorks: { h2: string; steps: { title: string; desc: string }[] };
  hindiBlock: { h2: string; paragraphs: string[] };
  comparison?: { h2: string; rows: { label: string; old: string; new: string }[] };
  faqs: { q: string; a: string }[];
  finalCta: { h2: string; sub: string };
}

const screenshots = [
  { img: screenshotAttendance, label: "Attendance" },
  { img: screenshotEarnings, label: "Payments" },
  { img: screenshotEmployee, label: "Workers" },
  { img: screenshotDashboard, label: "Dashboard" },
];

export function SeoLandingPage({ data }: { data: SeoLandingProps }) {
  const url = `https://kaamsaathi.app/${data.slug}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.meta.title,
    operatingSystem: "Android",
    applicationCategory: "BusinessApplication",
    description: data.meta.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "850" },
    downloadUrl: PLAY_URL,
    inLanguage: ["en", "hi"],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kaamsaathi.app/" },
      { "@type": "ListItem", position: 2, name: data.hero.h1, item: url },
    ],
  };

  return (
    <div>
      <Helmet>
        <title>{data.meta.title}</title>
        <meta name="description" content={data.meta.description} />
        <meta name="keywords" content={data.meta.keywords} />
        <meta property="og:title" content={data.meta.title} />
        <meta property="og:description" content={data.meta.description} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={workflowBg} alt={`${data.hero.h1} — construction site illustration`} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-primary/45" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90">{data.hero.badge}</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {data.hero.h1}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/95 mb-4">{data.hero.hindiSub}</p>
            <p className="text-base md:text-lg text-primary-foreground/90 mb-7 max-w-2xl mx-auto">{data.hero.intro}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a href={PLAY_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold w-full sm:w-auto">
                  <Download className="mr-2 h-5 w-5" /> Download on Play Store
                </Button>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 text-base font-semibold w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp पर बात करें
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center text-sm text-primary-foreground/90">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 100% Secure</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-current" /> 4.7★ Rated</span>
              <span className="inline-flex items-center gap-1.5"><WifiOff className="h-4 w-4" /> Offline Ready</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 10,000+ Contractors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">{data.intro.h2}</h2>
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            {data.intro.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-14 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{data.problems.h2}</h2>
            {data.problems.intro && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.problems.intro}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {data.problems.items.map((p, i) => (
              <Card key={i} className="border-border bg-background hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <p.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{data.features.h2}</h2>
            {data.features.intro && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{data.features.intro}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {data.features.items.map((f, i) => (
              <Card key={i} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">{data.benefits.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.benefits.items.map((b, i) => (
              <div key={i} className="flex items-start gap-3 bg-background border border-border rounded-lg p-4">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">{data.howItWorks.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.howItWorks.steps.map((s, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-3">{i + 1}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-14 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">{data.audience.h2}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {data.audience.items.map((a, i) => (
              <Card key={i} className="border-border bg-background hover:shadow-lg transition-shadow">
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <a.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{a.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hindi Block */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-primary/95 to-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{data.hindiBlock.h2}</h2>
          <div className="space-y-4 text-base md:text-lg leading-relaxed text-primary-foreground/95">
            {data.hindiBlock.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">App Screenshots</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {screenshots.map((s, i) => (
              <Card key={i} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img src={s.img} alt={`KaamSaathi ${s.label} screen`} className="w-full h-auto" loading="lazy" />
                  <p className="text-xs md:text-sm text-center text-muted-foreground py-2.5 font-medium">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison (optional) */}
      {data.comparison && (
        <section className="py-14 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">{data.comparison.h2}</h2>
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-4 font-semibold">—</th>
                    <th className="text-left p-4 font-semibold">पुराना तरीका</th>
                    <th className="text-left p-4 font-semibold">KaamSaathi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparison.rows.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{r.label}</td>
                      <td className="p-4 text-muted-foreground">{r.old}</td>
                      <td className="p-4 text-primary font-medium">{r.new}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {data.faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-foreground hover:text-primary text-left text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-10 bg-muted/40">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: "/worker-attendance-app", label: "Worker Attendance App" },
              { to: "/labour-management-app", label: "Labour Management App" },
              { to: "/contractor-attendance-app", label: "Contractor Attendance App" },
              { to: "/mazdoor-hajri-app", label: "मजदूर हाजरी ऐप" },
              { to: "/construction-site-management", label: "Construction Site Management" },
              { to: "/features", label: "All Features" },
              { to: "/pricing", label: "Pricing" },
              { to: "/faq", label: "FAQ" },
            ]
              .filter((l) => l.to !== `/${data.slug}`)
              .map((l) => (
                <Link key={l.to} to={l.to}>
                  <Button variant="outline" size="sm">{l.label}</Button>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{data.finalCta.h2}</h2>
          <p className="text-lg text-accent-foreground/90 mb-8">{data.finalCta.sub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={PLAY_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 w-full sm:w-auto">
                <Download className="mr-2 h-5 w-5" /> Download App
              </Button>
            </a>
            <Link to="/schedule-demo">
              <Button size="lg" variant="outline" className="border-accent-foreground/40 bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 w-full sm:w-auto">
                Request Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
