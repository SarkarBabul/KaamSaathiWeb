import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, CheckCircle2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { StatusBadge } from "@/app-desktop/components/shared/StatusBadge";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import { useAddSite, useUpdateSite } from "@/app-desktop/hooks/useSiteManagement";
import { ApiError } from "@/app-desktop/api/httpClient";
import type { Site } from "@/app-desktop/types/site";

const PIN_PATTERN = /^\d{6}$/;

interface SiteFormValues {
  siteName: string;
  address: string;
  pinCode: string;
}

// Angular's siteForm rules exactly (site-management.ts, Phase 3C source
// audit): siteName/address required, pinCode optional but must be a
// 6-digit pattern if provided — never required.
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

// Angular's site-management.html filter: client-side substring match on
// siteName/address/pinCode. This page's search box covers siteName and
// address per this task's scope; pinCode substring match omitted since it
// is optional/often absent on real records and wasn't required here.
function filterSites(sites: Site[], searchText: string): Site[] {
  const q = searchText.toLowerCase().trim();
  if (!q) return sites;
  return sites.filter(
    (s) => s.siteName.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
  );
}

export default function SiteManagement() {
  const { session } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const sitesQuery = useSites(session?.userId);
  const addSite = useAddSite(session?.userId);
  const updateSite = useUpdateSite(session?.userId);
  const submitting = addSite.isPending || updateSite.isPending;
  const mutationError = editingSite ? updateSite.error : addSite.error;

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema) as Resolver<SiteFormValues>,
    defaultValues: { siteName: "", address: "", pinCode: "" },
  });

  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);
  const filteredSites = useMemo(() => filterSites(sites, searchText), [sites, searchText]);
  const activeSiteCount = useMemo(() => sites.filter((s) => s.status === "ACTIVE").length, [sites]);

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
    <div className="space-y-5">
      <PageHeader eyebrow="Super Admin" title="Site Management" trailing={today} />

      {!sitesQuery.isLoading && !sitesQuery.isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Total Sites" value={sites.length} icon={Building2} tone="accent" emphasis index={0} />
          <StatCard label="Active Sites" value={activeSiteCount} icon={CheckCircle2} tone="positive" index={1} />
        </div>
      )}

      <GlowCard lift>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">All Sites</CardTitle>
            <p className="text-sm text-muted-foreground">Manage construction sites across your enterprise.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add site
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by site name or address"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-sm"
          />

          {sitesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : sitesQuery.isError ? (
            <ErrorState
              message={sitesQuery.error instanceof ApiError ? sitesQuery.error.message : "Could not load sites."}
              onRetry={() => sitesQuery.refetch()}
            />
          ) : filteredSites.length === 0 ? (
            <EmptyState
              title={sites.length === 0 ? "No sites yet" : "No sites match your search"}
              description={sites.length === 0 ? "Add a site to get started." : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>PIN code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site, i) => (
                    <AnimatedItem as={TableRow} key={site.siteId} index={i}>
                      <TableCell className="font-medium">{site.siteName}</TableCell>
                      <TableCell>{site.address}</TableCell>
                      <TableCell>{site.pinCode || "—"}</TableCell>
                      <TableCell>
                        {site.status ? (
                          <StatusBadge status={site.status} colorMap={SITE_STATUS_COLORS} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(site)} aria-label="Edit site">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </AnimatedItem>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </GlowCard>

      {/*
        Create/edit targets are SOURCE-DERIVED, NOT LIVE-VERIFIED — see
        siteManagement.api.ts. Site Management has no working delete/
        rollback endpoint anywhere in Angular (onDeleteSite() is a
        console.log stub, confirmed absent codebase-wide in the Phase 3C
        source audit), so a live create/edit mutation test was
        deliberately deferred rather than exercised against production
        with no safe cleanup path. No Delete action is offered here for
        the same reason Angular's is non-functional.
      */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? "Edit site" : "Create new site"}</DialogTitle>
            <DialogDescription>
              {editingSite ? "Update site information." : "Add a construction site."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mutationError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {mutationError instanceof Error ? mutationError.message : "Something went wrong"}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="sm-name">Site name</Label>
              <Input id="sm-name" placeholder="e.g. SGGR School" disabled={submitting} {...form.register("siteName")} />
              {form.formState.errors.siteName && (
                <p className="text-xs text-destructive">{form.formState.errors.siteName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sm-address">Address</Label>
              <Input id="sm-address" placeholder="e.g. Dehradun" disabled={submitting} {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sm-pin">PIN code</Label>
              <Input
                id="sm-pin"
                placeholder="e.g. 248001"
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
                {submitting ? (editingSite ? "Updating..." : "Adding...") : editingSite ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
