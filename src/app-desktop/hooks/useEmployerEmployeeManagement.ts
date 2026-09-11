import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEmployerEmployee,
  getEmployerEmployees,
  getEmployerRoles,
} from "@/app-desktop/api/employerEmployeeManagement.api";
import { deleteSubordinate, editSubordinate } from "@/app-desktop/api/userManagement.api";
import type { AddEmployeePayload } from "@/app-desktop/types/employerEmployee";
import type { EditSubordinatePayload } from "@/app-desktop/types/userManagement";

const EMPLOYEES_KEY = "employerEmployees";

export function useEmployerEmployees(parentId: string | undefined) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, parentId],
    queryFn: async () => {
      const res = await getEmployerEmployees(parentId!);
      if (res.status === "SUCCESS" && res.subordinates) {
        return res.subordinates;
      }
      return [];
    },
    enabled: Boolean(parentId),
  });
}

export function useEmployerRoles() {
  return useQuery({
    queryKey: ["employerRoles"],
    queryFn: async () => {
      const res = await getEmployerRoles();
      // The live endpoint returns a numeric `id` — normalized to a string
      // here so it compares equal to getSubordinate's string `roleId`
      // wherever a role needs to be matched/preselected against a record.
      return (res.data ?? []).map((role) => ({ id: String(role.id), roleName: role.roleName }));
    },
  });
}

export function useCreateEmployerEmployee(parentUserId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<AddEmployeePayload, "parentUserId">) => {
      if (!parentUserId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      const res = await addEmployerEmployee({ ...payload, parentUserId });
      if (res.status !== "SUCCESS") {
        throw new Error(res.statusMsg ?? res.message ?? "Could not add employee");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}

// Reuses the shared /v2/editSubordinate contract verified for Enterprise
// User Management (same endpoint, same target, same payload shape — see
// userManagement.api.ts) but with its own cache invalidation scoped to the
// employer list, so editing here never touches Enterprise's cached query.
export function useEditEmployerEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditSubordinatePayload) => {
      const res = await editSubordinate(payload);
      if (res.status !== "SUCCESS") {
        throw new Error(res.message ?? "Could not update employee");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}

// Reuses the shared /v2/authenticate/permanentDeleteSubordinate contract —
// same endpoint/target/payload as Enterprise, invoked here only because
// the employer list-employee.component.html actually wires a Delete
// button to it (Enterprise's own Delete menu item is commented out there).
export function useDeleteEmployerEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteSubordinate(id);
      if (res.status !== "SUCCESS") {
        throw new Error(res.statusMsg ?? "Could not delete employee");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}
