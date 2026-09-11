import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Reusable building blocks so every page-level skeleton below shares one
// visual language (shadcn's Skeleton — animate-pulse over bg-muted, already
// used throughout the app, e.g. ExpenseTracker.tsx's loading state) instead
// of each page re-implementing its own placeholder markup and animation.

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-32 rounded-md", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]", className)}>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-[#eef0f3] py-3.5 last:border-0", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
    </div>
  );
}

function SkeletonHeader({ withTrailing = true }: { withTrailing?: boolean }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-48" />
      </div>
      {withTrailing && <Skeleton className="h-4 w-28" />}
    </div>
  );
}

// Wraps every page skeleton with the accessible-loading-state semantics
// Part 14 asks for, without each individual skeleton needing to repeat it.
function SkeletonPage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-5">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-5">
        {children}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <SkeletonPage label="Loading dashboard">
      <SkeletonHeader />
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-4 w-80" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonPage>
  );
}

export function ListPageSkeleton() {
  return (
    <SkeletonPage label="Loading list">
      <SkeletonHeader />
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="ml-auto h-10 w-32 rounded-xl" />
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}

export function AttendanceSkeleton() {
  return (
    <SkeletonPage label="Loading attendance">
      <SkeletonHeader />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}

export function ReportSkeleton() {
  return (
    <SkeletonPage label="Loading report">
      <SkeletonHeader />
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="ml-auto h-10 w-44 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-8 w-full rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}

export function ExpenseTrackerSkeleton() {
  return (
    <SkeletonPage label="Loading expense tracker">
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}

export function ChatSkeleton() {
  return (
    <SkeletonPage label="Loading AI chat">
      <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
        <div className="flex items-center gap-3 border-b border-[#eef0f3] px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-b border-[#eef0f3] p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-14 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          <Skeleton className="h-16 w-3/4 rounded-2xl" />
        </div>
        <div className="border-t border-[#eef0f3] p-3">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </SkeletonPage>
  );
}

export function ProfileSkeleton() {
  return (
    <SkeletonPage label="Loading profile">
      <SkeletonHeader />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </CardContent>
        </Card>
      ))}
    </SkeletonPage>
  );
}

export function PricingSkeleton() {
  return (
    <SkeletonPage label="Loading pricing">
      <SkeletonHeader />
      <div className="flex justify-center">
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3.5 w-full" />
              ))}
              <Skeleton className="h-10 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonPage>
  );
}

export function FormPageSkeleton() {
  return (
    <SkeletonPage label="Loading form">
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}

export function LoginSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex flex-1 items-center justify-center p-6">
      <span className="sr-only">Loading sign-in</span>
      <div aria-hidden="true" className="w-full max-w-[440px] space-y-5 rounded-3xl bg-white p-9">
        <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto h-4 w-56" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <SkeletonPage label="Loading page">
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </SkeletonPage>
  );
}
