import { Construction } from "lucide-react";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";

interface PlaceholderPageProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export function PlaceholderPage({ title, description, eyebrow = "Super Admin" }: PlaceholderPageProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} trailing={today} />
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border-none bg-card p-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Construction className="h-8 w-8 text-muted-foreground/50" />
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
