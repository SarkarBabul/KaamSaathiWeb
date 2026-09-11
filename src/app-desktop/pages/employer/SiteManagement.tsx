import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, MapPin, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { StatusBadge } from "@/app-desktop/components/shared/StatusBadge";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import { useAddSite } from "@/app-desktop/hooks/useSiteManagement";
import { useUpdateEmployerSite } from "@/app-desktop/hooks/useEmployerSiteManagement";
import { ApiError } from "@/app-desktop/api/httpClient";
import type { Site } from "@/app-desktop/types/site";

const PIN_PATTERN = /^\d{6}$/;

interface SiteFormValues {
  siteName: string;
  address: string;
  pinCode: string;
}

// Matches the Angular Employer source exactly (site-management.component
// .ts's `siteForm`): siteName/address required, pinCode optional but must
// be a 6-digit pattern if provided — never required.
const siteSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required"),
  address: z.string().trim().min(1, "Address is required"),
  pinCode: z
    .string()
    .trim()
    .refine((v) => v === "" || PIN_PATTERN.test(v), "Enter a valid 6-digit PIN code"),
});

const SITE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "border-transparent bg-[#e5f8f0] text-[#17a085]",
  INACTIVE: "border-transparent bg-muted text-muted-foreground",
};

// Client-side only, over already-fetched data — the Angular Employer site
// list (site-management.component.html) has no search box at all (that
// only exists on the separate Enterprise page). Added here purely as a
// presentation enhancement, not an Angular-parity feature — null-safe
// across every field since real records can have missing address/pinCode.
function filterSites(sites: Site[], searchText: string): Site[] {
  const q = searchText.toLowerCase().trim();
  if (!q) return sites;
  return sites.filter(
    (s) =>
      (s.siteName ?? "").toLowerCase().includes(q) ||
      (s.address ?? "").toLowerCase().includes(q) ||
      (s.pinCode ?? "").toLowerCase().includes(q),
  );
}

export default function SiteManagement() {
  const { session } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const sitesQuery = useSites(session?.userId);
  const addSite = useAddSite(session?.userId);
  const updateSite = useUpdateEmployerSite(session?.userId);
  const submitting = addSite.isPending || updateSite.isPending;
  const mutationError = editingSite ? updateSite.error : addSite.error;

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema) as Resolver<SiteFormValues>,
    defaultValues: { siteName: "", address: "", pinCode: "" },
  });

  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);
  const filteredSites = useMemo(() => filterSites(sites, searchText), [sites, searchText]);

  const openCreate = () => {
    setEditingSite(null);
    form.reset({ siteName: "", address: "", pinCode: "" });
    addSite.reset();
    updateSite.reset();
    setFormOpen(true);
  };

  const openEdit = (site: Site) => {
    setEditingSite(site);
    form.reset({ siteName: site.siteName, address: site.address, pinCode: site.pinCode ?? "" });
    addSite.reset();
    updateSite.reset();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingSite(null);
  };

  const onSubmit = (values: SiteFormValues) => {
    if (editingSite) {
      updateSite.mutate(
        { siteId: editingSite.siteId, siteName: values.siteName, address: values.address, pinCode: values.pinCode },
        {
          onSuccess: () => {
            toast.success("Site updated");
            setFormOpen(false);
            setEditingSite(null);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Could not update site");
          },
        },
      );
    } else {
      addSite.mutate(values, {
        onSuccess: () => {
          toast.success("Site added");
          setFormOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Could not add site");
        },
      });
    }
  };

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employer" title="Site Management" trailing={today} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            All Sites{!sitesQuery.isLoading && !sitesQuery.isError && ` (${sites.length})`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your construction sites and work locations.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Site
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="site-search"
          name="site-search"
          placeholder="Search by name, address or PIN"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-9"
          aria-label="Search sites"
        />
      </div>

      {sitesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : sitesQuery.isError ? (
        <ErrorState
          message={sitesQuery.error instanceof ApiError ? sitesQuery.error.message : "Could not load sites."}
          onRetry={() => sitesQuery.refetch()}
        />
      ) : filteredSites.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={sites.length === 0 ? "No sites yet" : "No sites match your search"}
          description={
            sites.length === 0
              ? "Create your first site to start managing your construction projects."
              : "Try a different name, address or PIN code."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSites.map((site, i) => (
            <GlowCard key={site.siteId} index={i} lift className="flex flex-col justify-between p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-foreground">{site.siteName}</h3>
                    <p className="mt-1 flex items-start gap-1 text-[13px] leading-relaxed text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {site.address || "No address on file"}
                        {site.pinCode ? ` — ${site.pinCode}` : ""}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${site.siteName}`}
                  onClick={() => openEdit(site)}
                  className="shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {site.status && (
                <div className="mt-4">
                  <StatusBadge status={site.status} colorMap={SITE_STATUS_COLORS} />
                </div>
              )}
            </GlowCard>
          ))}
        </div>
      )}

      {/*
        Create/edit are SOURCE-DERIVED, NOT LIVE-MUTATION-VERIFIED for this
        phase — see employerSiteManagement.api.ts. The Angular Employer
        source (site-management.component.ts) has no delete/deactivate
        implementation whatsoever for this surface (unlike Enterprise's own
        console.log-stub onDeleteSite()), so no Delete action is offered
        here — there is nothing real to reproduce.
      */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? "Edit site" : "Add site"}</DialogTitle>
            <DialogDescription>
              {editingSite ? "Update this site's information." : "Add a new construction site to your account."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mutationError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {mutationError instanceof Error ? mutationError.message : "Something went wrong"}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="esm-name">
                Site name <span className="text-destructive">*</span>
              </Label>
              <Input id="esm-name" placeholder="e.g. Riverside Tower" disabled={submitting} {...form.register("siteName")} />
              {form.formState.errors.siteName && (
                <p className="text-xs text-destructive">{form.formState.errors.siteName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="esm-address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input id="esm-address" placeholder="e.g. Sector 12, Dehradun" disabled={submitting} {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="esm-pin">PIN code</Label>
              <Input
                id="esm-pin"
                placeholder="Optional — e.g. 248001"
                inputMode="numeric"
                maxLength={6}
                disabled={submitting}
                {...form.register("pinCode")}
              />
              {form.formState.errors.pinCode && (
                <p className="text-xs text-destructive">{form.formState.errors.pinCode.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (editingSite ? "Updating..." : "Adding...") : editingSite ? "Update site" : "Add site"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
