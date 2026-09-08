import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, BarChart3, Mic, Send, Users, IndianRupee, TrendingUp } from "lucide-react";

type Demo = {
  question: string;
  answer: string[]; // lines, **bold** allowed
  stats: { workers: string; pending: string; records: string };
};

const demos: Demo[] = [
  {
    question: "Show me payment summary for this week",
    answer: [
      "Here's your payment report for **abc test 1**:",
      "",
      "**Total Outstanding:** ₹4,850",
      "**Total Paid:** ₹800",
      "**Most Pending:** Manage 6 (₹2,050)",
      "**Period:** 28th April → 2nd May 2026",
      "",
      "💡 Tip: Tap **Reports → Payment Report** to download Excel.",
    ],
    stats: { workers: "3", pending: "₹4,850", records: "8" },
  },
  {
    question: "Who was absent yesterday?",
    answer: [
      "**2 workers** were absent on 1st May 2026:",
      "",
      "• **Ramesh Kumar** — Site: abc test 1",
      "• **Suresh Yadav** — Site: abc test 1",
      "",
      "✅ **6 workers** marked present.",
      "Tap **Attendance** to view full sheet.",
    ],
    stats: { workers: "8", pending: "₹3,200", records: "6" },
  },
  {
    question: "How much do I owe Manage 6?",
    answer: [
      "**Manage 6** payment summary:",
      "",
      "**Pending:** ₹2,050",
      "**Days Worked:** 11",
      "**Daily Wage:** ₹450",
      "**Last Paid:** 25th April 2026 (₹500)",
      "",
      "📲 Send reminder via WhatsApp from worker profile.",
    ],
    stats: { workers: "3", pending: "₹2,050", records: "11" },
  },
];

function renderLine(line: string, key: number) {
  if (!line) return <div key={key} className="h-2" />;
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div key={key} className="text-sm md:text-base text-foreground leading-relaxed">
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

export function AIShowcase() {
  const [demoIdx, setDemoIdx] = useState(0);
  const [typedQ, setTypedQ] = useState("");
  const [shownLines, setShownLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<"typing-q" | "thinking" | "answering" | "pause">("typing-q");
  const timersRef = useRef<number[]>([]);

  const current = demos[demoIdx];

  useEffect(() => {
    const clear = () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
    const push = (fn: () => void, ms: number) => {
      timersRef.current.push(window.setTimeout(fn, ms));
    };

    clear();
    setTypedQ("");
    setShownLines([]);
    setPhase("typing-q");

    // type question
    const q = current.question;
    for (let i = 1; i <= q.length; i++) {
      push(() => setTypedQ(q.slice(0, i)), i * 45);
    }
    const afterType = q.length * 45 + 400;
    push(() => setPhase("thinking"), afterType);

    // start streaming answer
    const streamStart = afterType + 900;
    push(() => setPhase("answering"), streamStart);
    current.answer.forEach((line, idx) => {
      push(() => setShownLines((prev) => [...prev, line]), streamStart + idx * 350);
    });
    const finished = streamStart + current.answer.length * 350 + 2800;
    push(() => setPhase("pause"), finished - 2800);
    push(() => setDemoIdx((i) => (i + 1) % demos.length), finished);

    return clear;
  }, [demoIdx]);

  return (
    <div className="w-full max-w-md lg:max-w-lg">
      <Card className="overflow-hidden border-2 border-primary-foreground/20 shadow-2xl shadow-black/20 bg-card">
        {/* Phone-like header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">KaamSaathi AI</span>
          </div>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground font-medium">
            LIVE
          </span>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 border-b border-border">
          <div className="bg-card rounded-lg p-2 border border-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground leading-tight">Workers</div>
              <div className="text-sm font-bold text-foreground tabular-nums">{current.stats.workers}</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-2 border border-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-orange-500/15 flex items-center justify-center shrink-0">
              <IndianRupee className="h-4 w-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground leading-tight">Pending</div>
              <div className="text-sm font-bold text-foreground tabular-nums truncate">{current.stats.pending}</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-2 border border-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-500/15 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground leading-tight">Records</div>
              <div className="text-sm font-bold text-foreground tabular-nums">{current.stats.records}</div>
            </div>
          </div>
        </div>

        {/* Conversation area */}
        <div className="p-4 bg-background min-h-[300px] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium">Ask anything about your reports</span>
          </div>

          {/* User question bubble */}
          <div className="flex justify-end animate-fade-in">
            <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2 shadow-sm">
              <span className="text-sm">
                {typedQ}
                {phase === "typing-q" && (
                  <span className="inline-block w-0.5 h-4 bg-primary-foreground ml-0.5 animate-pulse align-middle" />
                )}
              </span>
            </div>
          </div>

          {/* AI answer bubble */}
          {(phase === "thinking" || phase === "answering" || phase === "pause") && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[90%] bg-muted rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-border">
                {phase === "thinking" ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {shownLines.map((l, i) => renderLine(l, i))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-border bg-card flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full px-3 py-2 text-xs text-muted-foreground truncate">
            {phase === "typing-q" ? typedQ + "│" : "Ask a question or tap the mic..."}
          </div>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground" aria-label="Voice input">
            <Mic className="h-4 w-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </Card>

      {/* Badge under widget */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
        <span className="text-sm font-semibold text-primary-foreground">New • AI-powered Reports Assistant</span>
      </div>
    </div>
  );
}

