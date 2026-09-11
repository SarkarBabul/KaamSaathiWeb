import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Info, Search, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { EmployeeFormDialog } from "@/app-desktop/components/employer/EmployeeFormDialog";
import { PlanLimitDialog } from "@/app-desktop/components/employer/PlanLimitDialog";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import {
  useCreateEmployerEmployee,
  useDeleteEmployerEmployee,
  useEditEmployerEmployee,
  useEmployerEmployees,
  useEmployerRoles,
} from "@/app-desktop/hooks/useEmployerEmployeeManagement";
import { getAssignStatus } from "@/app-desktop/api/employerEmployeeManagement.api";
import { ApiError } from "@/app-desktop/api/httpClient";
import type { AssignStatus, EmployerEmployeeRecord } from "@/app-desktop/types/employerEmployee";

// Client-side only, over already-fetched data — the Angular employer list
// (list-employee.component.html) has no search box of its own, but this
// filters purely in-memory the same way Enterprise User Management's own
// (also Angular-absent) search box does, so it invents no backend behavior.
function filterEmployees(employees: EmployerEmployeeRecord[], searchText: string): EmployerEmployeeRecord[] {
  const q = searchText.toLowerCase().trim();
  if (!q) return employees;
  return employees.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      (e.mobileNumber ?? "").toLowerCase().includes(q) ||
      (e.siteName ?? "").toLowerCase().includes(q) ||
      (e.roleName ?? "").toLowerCase().includes(q),
  );
}

export default function EmployeeManagement() {
  const { session } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmployerEmployeeRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployerEmployeeRecord | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [planLimitOpen, setPlanLimitOpen] = useState(false);
  const [planLimitStatus, setPlanLimitStatus] = useState<AssignStatus | null>(null);

  const employeesQuery = useEmployerEmployees(session?.parentId);
  const rolesQuery = useEmployerRoles();
  const sitesQuery = useSites(session?.userId);
  const createEmployee = useCreateEmployerEmployee(session?.parentId);
  const editEmployee = useEditEmployerEmployee();
  const deleteEmployee = useDeleteEmployerEmployee();

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const filteredEmployees = useMemo(() => filterEmployees(employees, searchText), [employees, searchText]);
  const roles = rolesQuery.data ?? [];
  const sites = sitesQuery.data ?? [];

  const formMode = editingRecord ? "edit" : "add";
  const submitting = formMode === "add" ? checkingPlan || createEmployee.isPending : editEmployee.isPending;
  const mutationError = formMode === "add" ? createEmployee.error : editEmployee.error;

  const openAdd = () => {
    setEditingRecord(null);
    createEmployee.reset();
    editEmployee.reset();
    setFormOpen(true);
  };

  const openEdit = (record: EmployerEmployeeRecord) => {
    setEditingRecord(record);
    createEmployee.reset();
    editEmployee.reset();
    setFormOpen(true);
  };

  const closeForm = (open: boolean) => {
    if (!open) {
      setFormOpen(false);
      setEditingRecord(null);
    }
  };

  // Mirrors add-employee.component.ts's submit(): the plan/assignment
  // status is checked first, and the create call only fires when the
  // account is within its worker limit.
  const handleAdd: React.ComponentProps<typeof EmployeeFormDialog>["onAdd"] = async (payload) => {
    if (!session?.parentId) return;
    setCheckingPlan(true);
    try {
      const res = await getAssignStatus(session.parentId);
      if (res.data && res.data.withinLimit === false) {
        setPlanLimitStatus(res.data);
        setPlanLimitOpen(true);
        return;
      }
    } catch {
      // A failure of the secondary plan-status check should not block the
      // user — fall through and let the create call surface its own error.
    } finally {
      setCheckingPlan(false);
    }

    createEmployee.mutate(payload, {
      onSuccess: () => {
        toast.success("Employee added successfully");
        setFormOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to add employee");
      },
    });
  };

  const handleEdit: React.ComponentProps<typeof EmployeeFormDialog>["onEdit"] = (payload) => {
    editEmployee.mutate(payload, {
      onSuccess: () => {
        toast.success("Employee updated");
        setFormOpen(false);
        setEditingRecord(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not update employee");
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteEmployee.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Employee deleted");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not delete employee");
      },
    });
  };

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Employer" title="Employee Management" trailing={today} />

      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">
              All Employees{!employeesQuery.isLoading && !employeesQuery.isError && ` (${employees.length})`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Add workers, assign sites and manage your team.</p>
          </div>
          <Button onClick={openAdd}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="employee-search"
              name="employee-search"
              placeholder="Search by name, phone, role or site"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
              aria-label="Search employees"
            />
          </div>

          {employeesQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : employeesQuery.isError ? (
            <ErrorState
              message={employeesQuery.error instanceof ApiError ? employeesQuery.error.message : "Could not load employees."}
              onRetry={() => employeesQuery.refetch()}
            />
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title={employees.length === 0 ? "No employees yet" : "No employees match your search"}
              description={
                employees.length === 0
                  ? "Add your first employee to start tracking attendance and payments."
                  : "Try a different name, phone number, role or site."
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Daily rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee, i) => (
                    <AnimatedItem as={TableRow} key={employee.id} index={i}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {employee.isGeneratedMobile ? "No phone number" : employee.mobileNumber || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full border-none bg-[#e8f2ff] px-3.5 py-1 font-medium text-foreground">
                          {employee.roleName || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.siteName || "—"}</TableCell>
                      <TableCell>{employee.rate != null && employee.rate !== "" ? `₹${employee.rate}/day` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`View additional details for ${employee.name}`}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 text-sm">
                              <dl className="space-y-2">
                                <div className="flex justify-between gap-2">
                                  <dt className="text-muted-foreground">Aadhaar</dt>
                                  <dd className="font-medium">{employee.aadharNumber || "Not added"}</dd>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <dt className="text-muted-foreground">Father/Husband name</dt>
                                  <dd className="font-medium">{employee.parentName || "Not added"}</dd>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <dt className="text-muted-foreground">PAN</dt>
                                  <dd className="font-medium">{employee.panNumber || "Not added"}</dd>
                                </div>
                              </dl>
                            </PopoverContent>
                          </Popover>
                          <Button variant="ghost" size="icon" aria-label={`Edit ${employee.name}`} onClick={() => openEdit(employee)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${employee.name}`}
                            onClick={() => setDeleteTarget(employee)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </AnimatedItem>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={closeForm}
        mode={formMode}
        editingRecord={editingRecord}
        roles={roles}
        rolesLoading={rolesQuery.isLoading}
        sites={sites}
        sitesLoading={sitesQuery.isLoading}
        submitting={submitting}
        serverError={mutationError instanceof Error ? mutationError.message : null}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      <PlanLimitDialog open={planLimitOpen} onOpenChange={setPlanLimitOpen} status={planLimitStatus} />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium text-foreground">{deleteTarget?.name}</span> from
              your team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEmployee.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteEmployee.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
