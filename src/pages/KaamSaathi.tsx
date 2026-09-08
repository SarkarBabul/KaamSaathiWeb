import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Smartphone,
  Zap,
  TrendingUp,
  Download,
  BarChart3,
} from "lucide-react";

import kaamsaathiAppImg from "@/assets/kaamsaathi-app.jpg";
import workflowBg from "@/assets/kaamsaathi-workflow.jpg";
import screenshotDashboard from "@/assets/screenshot-dashboard.webp";
import screenshotPlans from "@/assets/screenshot-plans.webp";
import screenshotAttendance from "@/assets/screenshot-attendance.webp";
import screenshotLogin from "@/assets/screenshot-login.webp";
import screenshotEmployee from "@/assets/screenshot-employee.webp";
import screenshotEarnings from "@/assets/screenshot-earnings.webp";

export default function KaamSaathi() {
  const features = [
    {
      icon: Users,
      title: "Mark Workers' Attendance",
      description: "Quick and easy attendance marking for all your workers",
    },
    {
      icon: Clock,
      title: "Daily In/Out Time",
      description: "Track exact entry and exit times for accurate records",
    },
    {
      icon: Calendar,
      title: "Attendance History",
      description: "Complete history and records at your fingertips",
    },
    {
      icon: Zap,
      title: "Easy Interface",
      description: "Simple and intuitive design anyone can use",
    },
    {
      icon: Smartphone,
      title: "Lightweight App",
      description: "Fast and responsive on all Android devices",
    },
    {
      icon: TrendingUp,
      title: "Regular Updates",
      description: "Continuous improvements and new features",
    },
  ];

  const useCases = [
    "Construction Sites",
    "Small Business Owners",
    "Contractors",
    "Retail Shops",
    "Field Teams",
    "Service Providers",
  ];

  const comingSoon = [
    {
      icon: BarChart3,
      title: "Payment Tracking",
      description: "Track wages and payments easily",
    },
    {
      icon: Users,
      title: "Worker Management",
      description: "Complete worker profile management",
    },
    {
      icon: Calendar,
      title: "Reports & Analytics",
      description: "Detailed attendance and payment reports",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={workflowBg}
            alt="KaamSaathi attendance app workflow background"
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Lighter overlay so the workflow image is clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/45 to-primary/35" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
                Now in Beta
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                KaamSaathi Daily Wage Worker Attendance App
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8">
                A simple app to manage daily wage worker attendance for your teams
              </p>
              <a href="https://play.google.com/store/apps/details?id=com.KaamSaathi" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-base font-semibold"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download App
                </Button>
              </a>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-64 md:w-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={kaamsaathiAppImg}
                  alt="KaamSaathi app interface screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Overview */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={workflowBg}
            alt="KaamSaathi app workflow"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Your Business
            </h2>
            <p className="text-lg text-muted-foreground">
              KaamSaathi is designed specifically for contractors, small business owners, and teams
              who need a simple way to track attendance without complicated software.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border bg-card/90 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{useCase}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage attendance effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              App Screenshots
            </h2>
            <p className="text-lg text-muted-foreground">
              Take a look at the clean and simple interface
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {[
              { img: screenshotLogin, label: "Login" },
              { img: screenshotDashboard, label: "Dashboard" },
              { img: screenshotEmployee, label: "Employee Management" },
              { img: screenshotAttendance, label: "Attendance Module" },
              { img: screenshotEarnings, label: "Earnings Record" },
              { img: screenshotPlans, label: "Plans" },
            ].map((screenshot, index) => (
              <Card
                key={index}
                className="border-border overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-0">
                  <img
                    src={screenshot.img}
                    alt={screenshot.label}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <p className="text-xs text-center text-muted-foreground py-2 bg-muted/50">
                    {screenshot.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent text-accent-foreground">Coming Soon</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Future Modules
            </h2>
            <p className="text-lg text-muted-foreground">
              We're constantly working to add more features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {comingSoon.map((module, index) => (
              <Card
                key={index}
                className="border-2 border-dashed border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4">
                    <module.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Simplify Daily Wage Worker Attendance?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Download the app now and start managing your daily wage workers' attendance effortlessly
          </p>
          <a href="https://play.google.com/store/apps/details?id=com.KaamSaathi" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
              <Download className="mr-2 h-5 w-5" />
              Download App
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}