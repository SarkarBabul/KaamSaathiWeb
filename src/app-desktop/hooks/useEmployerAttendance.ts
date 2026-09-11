import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployerAttendanceByDate,
  getEmployerAttendanceHistory,
  getEmployerAttendanceWorkers,
  getEmployerEmployeeBalance,
  getEmployerLaborsBySite,
  getEmployerPaymentHistory,
  markEmployerAttendance,
  processEmployerPayment,
  updateEmployerAttendance,
} from "@/app-desktop/api/employerAttendance.api";
import type { AttendanceRequest } from "@/app-desktop/types/employerAttendance";

export function useEmployerAttendanceWorkers(parentId: string | undefined, siteId: string, leaderId: number) {
  return useQuery({
    queryKey: ["employerAttendanceWorkers", parentId, siteId],
    queryFn: () =>
      siteId === "all" ? getEmployerAttendanceWorkers(parentId!) : getEmployerLaborsBySite(Number(siteId), leaderId),
    enabled: Boolean(parentId),
  });
}

export function useEmployerAttendanceByDate(leaderId: string | undefined, date: string) {
  return useQuery({
    queryKey: ["employerAttendanceByDate", leaderId, date],
    queryFn: () => getEmployerAttendanceByDate(leaderId!, date),
    enabled: Boolean(leaderId),
  });
}

// The create-vs-update decision (attendance.component.ts's saveAttendance())
// depends on component-local "have I already seen a record for this
// worker+date" state, so that decision stays in the page; these two
// mutations are the raw building blocks it composes. Deliberately no
// onSuccess invalidation here — the Angular source's own documented fix
// (`skipNextReload`) exists specifically to avoid refetching after every
// single attendance click, since the optimistic local update is already
// correct; the page only refetches when the date/site actually changes.
export function useMarkEmployerAttendance() {
  return useMutation({
    mutationFn: (records: AttendanceRequest[]) => markEmployerAttendance(records),
  });
}

export function useUpdateEmployerAttendance() {
  return useMutation({
    mutationFn: (records: AttendanceRequest[]) => updateEmployerAttendance(records),
  });
}

export function useEmployerEmployeeBalance(userId: string, leaderId: string | undefined) {
  return useQuery({
    queryKey: ["employerEmployeeBalance", userId, leaderId],
    queryFn: () => getEmployerEmployeeBalance(userId, leaderId!),
    enabled: Boolean(userId) && Boolean(leaderId),
  });
}

export function useEmployerAttendanceHistory(userId: string) {
  return useQuery({
    queryKey: ["employerAttendanceHistory", userId],
    queryFn: () => getEmployerAttendanceHistory(userId),
    enabled: Boolean(userId),
  });
}

// Angular defaults to a 6-months-ago start date and today as the end date
// (record-payment.component.ts's getStartDate()/getEndDate()).
function sixMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
}

export function useEmployerPaymentHistory(userId: string) {
  return useQuery({
    queryKey: ["employerPaymentHistory", userId],
    queryFn: () => getEmployerPaymentHistory(userId, sixMonthsAgo(), new Date().toISOString().split("T")[0]),
    enabled: Boolean(userId),
  });
}

export function useProcessEmployerPayment(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payment: { userId: number; amount: number; paymentMode: string; paymentDate: string; remarks: string; adminId: string }) =>
      processEmployerPayment(payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employerEmployeeBalance", userId] });
      queryClient.invalidateQueries({ queryKey: ["employerPaymentHistory", userId] });
    },
  });
}
