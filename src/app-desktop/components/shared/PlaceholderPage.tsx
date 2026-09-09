interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
    </div>
  );
}
