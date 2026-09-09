import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, UserPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSubordinates } from "@/app-desktop/hooks/useUserManagement";
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

  const usersQuery = useSubordinates(session?.parentId);
  const sitesQuery = useSites(session?.userId);

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const filteredUsers = useMemo(() => filterUsers(users, searchText), [users, searchText]);
  const sites = sitesQuery.data ?? [];

  const openAddUser = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEditUser = (user: EnterpriseUser) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Super Admin</p>
        <h1 className="text-2xl font-semibold">User Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Team Directory</CardTitle>
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.id}</div>
                      </TableCell>
                      <TableCell>{user.mobileNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.roleName}</Badge>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/*
        Structural placeholder only — mirrors the live Angular Add/Edit
        form fields (name, mobileNumber, role, site_id) but performs NO
        network call. The addSubordinate/editSubordinate contract (API
        target + payload key names) is an unresolved conflict between
        Angular's live enterprise route and the cross-client consensus
        (legacy Angular + Flutter) — see USER_MANAGEMENT_API_VERIFICATION.md
        §16/§19. PENDING PHASE 3B API DECISION.
      */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>Login credentials are auto-generated.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="um-name">Full name</Label>
              <Input id="um-name" placeholder="e.g. Ramesh Yadav" defaultValue={editingUser?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="um-mobile">Mobile number</Label>
              <Input
                id="um-mobile"
                placeholder="9911643948"
                maxLength={10}
                defaultValue={editingUser?.mobileNumber}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select defaultValue={editingUser?.roleId ? "supervisor" : undefined}>
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
                <Select defaultValue={editingUser ? String(editingUser.siteId) : undefined}>
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
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button disabled title="Create/edit API contract is unresolved — pending Phase 3B">
              {editingUser ? "Update" : "Add"} (Pending Phase 3B)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
