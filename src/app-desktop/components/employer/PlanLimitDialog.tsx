import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AssignStatus } from "@/app-desktop/types/employerEmployee";

interface PlanLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: AssignStatus | null;
}

// Mirrors add-employee.component.html's plan-limit popup, shown only when
// getAssignStatus() reports `withinLimit: false` — never a fabricated
// warning, only real plan-usage numbers passed in from that response.
export function PlanLimitDialog({ open, onOpenChange, status }: PlanLimitDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Plan limit reached</DialogTitle>
          <DialogDescription>
            You've reached the maximum employee limit in your current plan. Upgrade your plan or manage existing
            employees.
          </DialogDescription>
        </DialogHeader>

        {status && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted/50 p-4 text-sm">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-right font-medium">{status.planName ?? "—"}</dd>
            <dt className="text-muted-foreground">Limit</dt>
            <dd className="text-right font-medium">{status.workerLimit ?? "—"}</dd>
            <dt className="text-muted-foreground">Assigned</dt>
            <dd className="text-right font-medium">{status.assignedCount ?? "—"}</dd>
          </dl>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Manage employees
          </Button>
          <Button onClick={() => navigate("/dashboard/employer/plan")}>Upgrade plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
