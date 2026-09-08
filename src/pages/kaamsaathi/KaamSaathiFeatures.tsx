import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, Calendar, Zap, Smartphone, TrendingUp,
  Download, MapPin, Shield, Bell, IndianRupee,
} from "lucide-react";
import screenshotDashboard from "@/assets/screenshot-dashboard.webp";
import screenshotPlans from "@/assets/screenshot-plans.webp";
import screenshotAttendance from "@/assets/screenshot-attendance.webp";
import screenshotLogin from "@/assets/screenshot-login.webp";
import screenshotEmployee from "@/assets/screenshot-employee.webp";
import screenshotEarnings from "@/assets/screenshot-earnings.webp";

const features = [
  { icon: Users, title: "Mark Daily Wage Workers' Attendance", description: "Quick and easy daily wage worker attendance marking with a single tap." },
  { icon: FileText, title: "Reports", description: "Generate detailed daily wage worker attendance and payment reports for your workforce." },
  { icon: IndianRupee, title: "Worker Payment Tracking", description: "Keep track of daily wage worker payments, dues, and earnings in one place." },
  { icon: Calendar, title: "Attendance History", description: "Complete monthly and yearly daily wage worker attendance records at your fingertips." },
  { icon: Zap, title: "Easy Interface", description: "Simple and intuitive design that anyone can use without training." },
  { icon: Smartphone, title: "Lightweight App", description: "Under 10MB, fast and responsive on all Android devices." },
  { icon: TrendingUp, title: "Regular Updates", description: "Continuous improvements and new features based on user feedback." },
  { icon: MapPin, title: "Site Management", description: "Create and manage multiple work sites from one dashboard." },
  { icon: Shield, title: "Data Security", description: "Your data stays safe with encrypted storage and backups." },
  { icon: Bell, title: "Smart Notifications", description: "Get reminders for unmarked attendance and important updates." },
];


const screenshots = [
  { img: screenshotLogin, label: "Login" },
  { img: screenshotDashboard, label: "Dashboard" },
  { img: screenshotEmployee, label: "Employee Management" },
  { img: screenshotAttendance, label: "Attendance" },
  { img: screenshotEarnings, label: "Earnings" },
  { img: screenshotPlans, label: "Plans" },
];

export default function KaamSaathiFeatures() {
  return (
    <div>
      <Helmet>
        <title>KaamSaathi Features — Worker Attendance, Payroll & Site Management</title>
        <meta name="description" content="Explore KaamSaathi features: worker attendance tracking, payroll management, multi-site support, offline mode, and secure cloud backup. Built for Indian contractors." />
      </Helmet>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features, Simple Design</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Everything you need to manage daily wage worker attendance — nothing you don't.
          </p>
        </div>
      </section>

      {/* All Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">App Features</h2>
            <p className="text-lg text-muted-foreground">Available now in the app</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => {
              const colorStyles = [
                { bg: "bg-primary/10", icon: "text-primary", border: "border-primary/20" },
                { bg: "bg-accent/10", icon: "text-accent", border: "border-accent/20" },
                { bg: "bg-secondary", icon: "text-secondary-foreground", border: "border-secondary" },
              ];
              const style = colorStyles[i % 3];
              return (
                <Card key={i} className={`border ${style.border} hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${style.bg} flex items-center justify-center`}>
                        <f.icon className={`h-6 w-6 ${style.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{f.title}</h3>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">App Screenshots</h2>
            <p className="text-lg text-muted-foreground">Clean, intuitive interface for everyday use</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {screenshots.map((s, i) => (
              <Card key={i} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img src={s.img} alt={s.label} className="w-full h-auto" loading="lazy" />
                  <p className="text-xs text-center text-muted-foreground py-2 bg-muted/50">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Try KaamSaathi Today</h2>
          <p className="text-lg text-accent-foreground/90 mb-8">Download the app and experience simple daily wage worker attendance management.</p>
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