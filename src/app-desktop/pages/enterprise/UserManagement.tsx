import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, UserPlus, Upload, Users as UsersIcon, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { StatCard } from "@/app-desktop/components/shared/StatCard";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useCreateSubordinate, useEditSubordinate, useSubordinates } from "@/app-desktop/hooks/useUserManagement";
import { useSites } from "@/app-desktop/hooks/useSites";
import { ApiError } from "@/app-desktop/api/httpClient";
import type { EnterpriseUser } from "@/app-desktop/types/userManagement";

// Verified against the real Angular template
// (enterprise-user/pages/user-management/user-management.html): the search
// box is the only live filter. The role-filter dropdown, the status
// column/toggle, and the row's Delete menu item are all present in the
// TypeScript component but commented out of the template — they render
// nothing in the live app and are intentionally not reproduced here.
// "Bulk import" has no click handler in Angular either — decorative only.
function filterUsers(users: EnterpriseUser[], searchText: string): EnterpriseUser[] {
  const q = searchText.toLowerCase().trim();
  if (!q) return users;
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.mobileNumber.toLowerCase().includes(q) ||
      u.siteName.toLowerCase().includes(q),
  );
}

export default function UserManagement() {
  const { session } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EnterpriseUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formSiteId, setFormSiteId] = useState<string>("");

  const usersQuery = useSubordinates(session?.parentId);
  const sitesQuery = useSites(session?.userId);
  const createUser = useCreateSubordinate(session?.parentId);
  const editUser = useEditSubordinate();
  const submitting = createUser.isPending || editUser.isPending;
  const mutationError = editingUser ? editUser.error : createUser.error;

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const filteredUsers = useMemo(() => filterUsers(users, searchText), [users, searchText]);
  const sites = sitesQuery.data ?? [];

  // Derived straight from the already-fetched roster — no extra API call,
  // no fabricated figures. Gives the page a real (if small) Bento summary
  // instead of dropping straight into the table.
  const coveredSiteCount = useMemo(() => new Set(users.map((u) => u.siteId)).size, [users]);

  const resetForm = () => {
    setFormName("");
    setFormSiteId("");
    createUser.reset();
    editUser.reset();
  };

  const openAddUser = () => {
    setEditingUser(null);
    resetForm();
    setFormOpen(true);
  };

  const openEditUser = (user: EnterpriseUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormSiteId(String(user.siteId));
    createUser.reset();
    editUser.reset();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingUser(null);
    resetForm();
  };

  // Task 5/6: validate → submitting state → call the verified API → on
  // success close/reset + refresh (via the mutation hooks' own
  // invalidateQueries) + toast; on failure keep the dialog open with the
  // user's values intact and show only the sanitized Error.message the
  // hook threw (never the raw response/headers/tokens).
  const handleSubmit = () => {
    if (submitting) return;

    const trimmedName = formName.trim();
    const siteId = Number(formSiteId);
    if (!trimmedName || !formSiteId || Number.isNaN(siteId)) {
      toast.error("Name and site are required");
      return;
    }

    if (editingUser) {
      editUser.mutate(
        {
          id: editingUser.id,
          name: trimmedName,
          mobileNumber: editingUser.mobileNumber,
          aadharNumber: editingUser.aadharNumber ?? null,
          site_id: siteId,
          role: editingUser.roleId,
          rate: editingUser.rate ?? null,
          parentName: editingUser.parentName ?? null,
          panNumber: editingUser.panNumber ?? null,
        },
        {
          onSuccess: () => {
            toast.success("User updated");
            setFormOpen(false);
            setEditingUser(null);
            resetForm();
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Could not update user");
          },
        },
      );
    } else {
      createUser.mutate(
        { name: trimmedName, site_id: siteId },
        {
          onSuccess: () => {
            toast.success("User added");
            setFormOpen(false);
            resetForm();
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Could not add user");
          },
        },
      );
    }
  };

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Super Admin" title="User Management" trailing={today} />

      {!usersQuery.isLoading && !usersQuery.isError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Site Managers" value={users.length} icon={UsersIcon} tone="accent" emphasis index={0} />
          <StatCard label="Sites Covered" value={coveredSiteCount} icon={Building2} tone="accent" index={1} />
        </div>
      )}

      <GlowCard lift>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">Team Directory</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage Site Managers — assign sites, control access, send credentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled title="Not implemented in the live Angular app (no click handler)">
              <Upload className="mr-2 h-4 w-4" /> Bulk import
            </Button>
            <Button onClick={openAddUser}>
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name, mobile or site"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-sm"
          />

          {usersQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : usersQuery.isError ? (
            <ErrorState
              message={
                usersQuery.error instanceof ApiError ? usersQuery.error.message : "Could not load users."
              }
              onRetry={() => usersQuery.refetch()}
            />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title={users.length === 0 ? "No users yet" : "User does not match!"}
              description={
                users.length === 0
                  ? "Add a site manager to get started."
                  : "No users match your search."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned site</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, i) => (
                    <AnimatedItem as={TableRow} key={user.id} index={i}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.id}</div>
                      </TableCell>
                      <TableCell>{user.mobileNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full border-none bg-[#e8f2ff] px-3.5 py-1 font-medium text-foreground">
                          {user.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.siteName}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {/* Delete is commented out in the live Angular template's
                                enterprise User Management menu — intentionally not
                                reproduced here (see USER_MANAGEMENT_API_VERIFICATION.md). */}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        Create/edit use the LIVE-VERIFIED contracts from
        USER_MANAGEMENT_API_VERIFICATION.md §27 (create) and §28 (edit):
        target `default`, POST /v2/addSubordinate and /v2/editSubordinate,
        site_id (not siteId), id (not userId). Role is fixed to the single
        verified value "supervisor" — the live Angular form only ever
        offers one role option too, so this isn't a UI regression.
      */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update this site manager's name or assigned site."
                : "Login credentials are auto-generated — no mobile number needed."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {mutationError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {mutationError instanceof Error ? mutationError.message : "Something went wrong"}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="um-name">Full name</Label>
              <Input
                id="um-name"
                placeholder="e.g. Ramesh Yadav"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={submitting}
              />
            </div>
            {editingUser && (
              <div className="space-y-1.5">
                <Label htmlFor="um-mobile">Mobile number</Label>
                <Input id="um-mobile" value={editingUser.mobileNumber} disabled readOnly />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value="supervisor" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assigned site</Label>
                <Select value={formSiteId} onValueChange={setFormSiteId} disabled={submitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.siteId} value={String(site.siteId)}>
                        {site.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formName.trim() || !formSiteId}>
              {submitting ? (editingUser ? "Updating..." : "Adding...") : editingUser ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
