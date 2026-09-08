import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Languages,
  BarChart3,
  UserCheck,
  BrainCircuit,
  ArrowRight,
  Play,
  Send,
  Bot,
  User,
  IndianRupee,
  Users,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const exampleQuestions = [
  "आज कितने मजदूर आए?",
  "कितनी पेमेंट बाकी है?",
  "How much payment is pending?",
  "Vendor labour का कितना payment बाकी है?",
  "Which site has lowest attendance?",
  "इस महीने कितनी मजदूरी हुई?",
];

const benefits = [
  { icon: Zap, title: "Instant Answers", desc: "Turant jawab — koi wait nahi" },
  { icon: Languages, title: "Hindi + English", desc: "Hinglish mein bhi samajhta hai" },
  { icon: BarChart3, title: "Smart Reports", desc: "Auto labour reports banaye" },
  { icon: UserCheck, title: "Contractor Friendly", desc: "Bina training ke chale" },
  { icon: BrainCircuit, title: "AI Insights", desc: "Smart payment reminders" },
];

const demoConversation = [
  { type: "user", text: "इस महीने Manage 6 का कितना payment बाकी है?" },
  { type: "ai", lines: ["**Manage 6** ka payment summary:", "", "**Pending:** ₹2,050", "**Days Worked:** 11 days", "**Daily Wage:** ₹450", "**Last Paid:** 25th April (₹500)", "", "📲 WhatsApp par reminder bhejein."] },
];

function renderAILine(line: string, key: number) {
  if (!line) return <div key={key} className="h-1.5" />;
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div key={key} className="text-[13px] leading-relaxed text-foreground/90">
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </div>
  );
}

export function KaamSaathiAIFeature() {
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const [chatStep, setChatStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start bubble animations
            exampleQuestions.forEach((_, idx) => {
              const t = window.setTimeout(() => {
                setVisibleBubbles((prev) => Math.max(prev, idx + 1));
              }, 400 + idx * 220);
              timersRef.current.push(t);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (visibleBubbles < exampleQuestions.length) return;
    // Start chat demo after bubbles finish
    const t1 = window.setTimeout(() => setChatStep(1), 600);
    timersRef.current.push(t1);

    const q = demoConversation[0].text;
    for (let i = 1; i <= q.length; i++) {
      const t = window.setTimeout(() => setTypedText(q.slice(0, i)), 600 + i * 35);
      timersRef.current.push(t);
    }
    const t2 = window.setTimeout(() => setChatStep(2), 600 + q.length * 35 + 400);
    timersRef.current.push(t2);
    const t3 = window.setTimeout(() => setChatStep(3), 600 + q.length * 35 + 1200);
    timersRef.current.push(t3);
  }, [visibleBubbles]);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50/40 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/10 to-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-400/8 to-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* LEFT COLUMN */}
          <div className="order-2 lg:order-1">
            <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 font-semibold px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> New — KaamSaathi AI
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-foreground leading-tight mb-3">
              Ask Questions About Your Site Reports
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-primary mb-4 leading-snug">
              अब रिपोर्ट पढ़ने की जरूरत नहीं — बस सवाल पूछिए
            </p>

            <p className="text-base text-muted-foreground mb-2 leading-relaxed max-w-xl">
              Track worker attendance, labour payments, site records and pending amounts instantly using KaamSaathi AI.
            </p>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed max-w-xl">
              मजदूरों की हाजरी, पेमेंट और साइट रिकॉर्ड अब आसान सवालों से जानें।
            </p>

            {/* Example question bubbles */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-primary" />
                Try asking:
                <span className="text-muted-foreground font-normal">(Bas yeh questions poochhein)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((q, i) => (
                  <div
                    key={i}
                    className={`px-3.5 py-2 rounded-2xl text-sm border transition-all duration-500 ${
                      i < visibleBubbles
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3 pointer-events-none"
                    } ${
                      i % 2 === 0
                        ? "bg-primary text-primary-foreground border-primary/30 rounded-bl-sm"
                        : "bg-card text-foreground border-border rounded-br-sm"
                    }`}
                  >
                    {q}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-card/60 border border-border/60 hover:bg-card hover:border-primary/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-sky-400/15 flex items-center justify-center shrink-0 mt-0.5">
                    <b.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.KaamSaathi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-sky-600 hover:from-primary/90 hover:to-sky-600/90 text-primary-foreground shadow-lg shadow-primary/20 font-semibold w-full sm:w-auto"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try KaamSaathi AI
                </Button>
              </a>
              <a
                href="https://wa.me/919997394773?text=Hello!%20I%20want%20to%20see%20a%20demo%20of%20KaamSaathi%20AI."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5 font-semibold w-full sm:w-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </a>
            </div>

            {/* SEO microcopy */}
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                AI attendance app
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Smart contractor app
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Labour report app
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN — AI Chat Mockup */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {/* Phone frame */}
              <div className="bg-card rounded-[2rem] border-2 border-border shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-sky-600 px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-foreground truncate">KaamSaathi AI</p>
                    <p className="text-xs text-primary-foreground/80 truncate">Online — Hindi & English</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-50 font-medium border border-emerald-400/30">
                    ● LIVE
                  </span>
                </div>

                {/* Mini stats strip */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 border-b border-border">
                  {[
                    { icon: Users, label: "Workers", value: "24", color: "text-emerald-600", bg: "bg-emerald-500/10" },
                    { icon: IndianRupee, label: "Pending", value: "₹12,450", color: "text-orange-600", bg: "bg-orange-500/10" },
                    { icon: TrendingUp, label: "Records", value: "156", color: "text-sky-600", bg: "bg-sky-500/10" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-lg p-2 border border-border/60 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-md ${stat.bg} flex items-center justify-center shrink-0`}>
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-muted-foreground leading-tight">{stat.label}</div>
                        <div className="text-xs font-bold text-foreground tabular-nums truncate">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat area */}
                <div className="p-4 bg-background min-h-[280px] flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-medium">Ask anything about your reports</span>
                  </div>

                  {/* User message */}
                  {chatStep >= 1 && (
                    <div className="flex justify-end animate-fade-in">
                      <div className="max-w-[85%] bg-gradient-to-br from-primary to-sky-600 text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <User className="h-3 w-3 opacity-70" />
                          <span className="text-[10px] opacity-70 font-medium">You</span>
                        </div>
                        <span className="text-sm">
                          {typedText}
                          {chatStep === 1 && (
                            <span className="inline-block w-0.5 h-4 bg-primary-foreground/70 ml-0.5 animate-pulse align-middle" />
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* AI thinking */}
                  {chatStep === 2 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[70%] bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
                          <span className="text-xs text-muted-foreground ml-1">KaamSaathi AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI response */}
                  {chatStep === 3 && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[90%] bg-gradient-to-br from-muted to-blue-50/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">KaamSaathi AI</span>
                        </div>
                        <div className="space-y-0.5">
                          {(demoConversation[1] as { type: string; lines: string[] }).lines.map((l, i) => renderAILine(l, i))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggested chips */}
                  {chatStep === 3 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 animate-fade-in">
                      {["Vendor payment status?", "Lowest attendance site?", "This week summary"].map((chip, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs text-primary hover:bg-primary/10 transition-colors cursor-default"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="p-3 border-t border-border bg-card flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full px-4 py-2.5 text-xs text-muted-foreground truncate">
                    Type your question in Hindi or English...
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center text-primary-foreground shadow-md">
                    <Send className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Floating badge under phone */}
              <div className="flex items-center justify-center gap-2 mt-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  AI-powered Reports Assistant
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  BETA
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
