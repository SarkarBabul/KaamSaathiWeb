import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Site } from "@/app-desktop/types/site";
import type { AddEmployeePayload, EmployerEmployeeRecord, EmployerRole } from "@/app-desktop/types/employerEmployee";
import type { EditSubordinatePayload } from "@/app-desktop/types/userManagement";

// Types are hand-written rather than derived via z.infer, matching this
// project's established convention (see Login.tsx): the installed
// zod/TypeScript combination resolves z.infer on a plain z.object to an
// all-optional shape, so the schema below is runtime validation only.
interface EmployeeFormValues {
  fullName: string;
  roleId: string;
  siteId: string;
  isGeneratedMobile: boolean;
  phone: string;
  dailyWage: string;
  aadharNumber: string;
  pancard: string;
  parentname: string;
}

const EMPTY_VALUES: EmployeeFormValues = {
  fullName: "",
  roleId: "",
  siteId: "",
  isGeneratedMobile: false,
  phone: "",
  dailyWage: "",
  aadharNumber: "",
  pancard: "",
  parentname: "",
};

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

// The Add and Edit Angular forms use genuinely different Aadhaar patterns —
// add-employee.component.ts requires the first digit to be 2-9
// (/^[2-9][0-9]{11}$/), while edit-elist.component.ts accepts any 12 digits
// (/^[0-9]{12}$/). Preserved exactly rather than reconciled, per the brief's
// instruction not to invent a silent reconciliation between two real,
// independently-verified source validators.
function buildSchema(mode: "add" | "edit") {
  return z
    .object({
      fullName: z.string().trim().min(1, "Full name is required"),
      roleId: z.string().min(1, "Role is required"),
      siteId: z.string().min(1, "Site is required"),
      isGeneratedMobile: z.boolean(),
      phone: z.string(),
      dailyWage: z.string(),
      aadharNumber: z.string(),
      pancard: z.string(),
      parentname: z.string(),
    })
    .superRefine((data, ctx) => {
      // add-employee.component.ts never adds Validators.required to phone —
      // only edit-elist.component.ts does, and only when not generated.
      if (!data.isGeneratedMobile) {
        if (mode === "edit" && !data.phone) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Phone number is required" });
        } else if (data.phone && !PHONE_PATTERN.test(data.phone)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Enter a valid 10-digit phone number" });
        }
      }

      if (data.aadharNumber) {
        const pattern = mode === "add" ? /^[2-9][0-9]{11}$/ : /^[0-9]{12}$/;
        if (!pattern.test(data.aadharNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["aadharNumber"],
            message: "Enter a valid 12-digit Aadhaar number",
          });
        }
      }

      if (data.pancard && !PAN_PATTERN.test(data.pancard)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pancard"], message: "Enter a valid PAN number (e.g. ABCDE1234F)" });
      }
    });
}

function recordToFormValues(record: EmployerEmployeeRecord): EmployeeFormValues {
  return {
    fullName: record.name,
    roleId: record.roleId,
    siteId: String(record.siteId),
    isGeneratedMobile: record.isGeneratedMobile,
    phone: record.isGeneratedMobile ? "" : record.mobileNumber ?? "",
    dailyWage: record.rate != null ? String(record.rate) : "",
    aadharNumber: record.aadharNumber ?? "",
    pancard: record.panNumber ?? "",
    parentname: record.parentName ?? "",
  };
}

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editingRecord: EmployerEmployeeRecord | null;
  roles: EmployerRole[];
  rolesLoading: boolean;
  sites: Site[];
  sitesLoading: boolean;
  submitting: boolean;
  serverError: string | null;
  onAdd: (payload: Omit<AddEmployeePayload, "parentUserId">) => void;
  onEdit: (payload: EditSubordinatePayload) => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  mode,
  editingRecord,
  roles,
  rolesLoading,
  sites,
  sitesLoading,
  submitting,
  serverError,
  onAdd,
  onEdit,
}: EmployeeFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(buildSchema(mode)) as Resolver<EmployeeFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  // Re-seed the form whenever the dialog opens for a fresh add, or for a
  // specific record to edit — never carries stale values from whichever
  // record (or blank state) the dialog last showed.
  useEffect(() => {
    if (!open) return;
    reset(editingRecord ? recordToFormValues(editingRecord) : EMPTY_VALUES);
  }, [open, editingRecord, reset]);

  const isGeneratedMobile = watch("isGeneratedMobile");

  // Live data shows many existing records carry a legacy free-text roleId
  // (e.g. "MASON", or a Hindi role name used directly) that predates the
  // numeric role catalog and will never appear in `roles`. Without this,
  // the Select would silently show no selection at all for those records —
  // injecting the record's own value keeps its current role visible and
  // preserved unless the admin deliberately picks a catalog role instead.
  const roleOptions = useMemo(() => {
    if (!editingRecord) return roles;
    if (roles.some((r) => r.id === editingRecord.roleId)) return roles;
    return [{ id: editingRecord.roleId, roleName: editingRecord.roleName ?? editingRecord.roleId }, ...roles];
  }, [roles, editingRecord]);

  // Same real-data issue as roles: getAllSites is scoped to the account's
  // *current* sites, but a record can carry a siteId that predates or falls
  // outside that scope (e.g. site 48 "One" isn't in this account's own
  // getAllSites response at all). Without this the Select would show no
  // selection and a false "Site is required" error on a record that
  // already has a perfectly valid site.
  const siteOptions = useMemo(() => {
    if (!editingRecord) return sites;
    if (sites.some((s) => String(s.siteId) === String(editingRecord.siteId))) return sites;
    return [
      { siteId: editingRecord.siteId, siteName: editingRecord.siteName ?? `Site #${editingRecord.siteId}` } as Site,
      ...sites,
    ];
  }, [sites, editingRecord]);

  const submit = handleSubmit((values) => {
    if (mode === "add") {
      const payload: Omit<AddEmployeePayload, "parentUserId"> = {
        name: values.fullName.trim(),
        role: values.roleId,
        site_id: Number(values.siteId),
        isGeneratedMobile: values.isGeneratedMobile,
      };
      // Mirrors add-employee.component.ts's addEmployee(): optional fields
      // are omitted entirely when blank, never sent as null/"". mobileNumber
      // is the one exception — included whenever not generated, even blank.
      if (!values.isGeneratedMobile) payload.mobileNumber = values.phone;
      if (values.dailyWage) payload.rate = Number(values.dailyWage);
      if (values.parentname) payload.parentName = values.parentname;
      if (values.pancard) payload.panNumber = values.pancard;
      if (values.aadharNumber) payload.aadharNumber = values.aadharNumber;
      onAdd(payload);
      return;
    }

    if (!editingRecord) return;
    onEdit({
      id: editingRecord.id,
      name: values.fullName.trim(),
      mobileNumber: values.isGeneratedMobile ? editingRecord.mobileNumber ?? "" : values.phone,
      aadharNumber: values.aadharNumber || null,
      site_id: Number(values.siteId),
      role: values.roleId,
      rate: values.dailyWage || null,
      parentName: values.parentname || null,
      panNumber: values.pancard || null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Employee" : "Edit Employee"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a worker to your team and assign them to a site."
              : "Update this employee's details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="emp-name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input id="emp-name" placeholder="Enter full name" disabled={submitting} {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emp-role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              name="roleId"
              value={watch("roleId")}
              onValueChange={(v) => setValue("roleId", v, { shouldValidate: true })}
              disabled={submitting || rolesLoading}
            >
              <SelectTrigger id="emp-role">
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
          </div>

          {mode === "add" && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="emp-generated-mobile"
                name="isGeneratedMobile"
                checked={isGeneratedMobile}
                onCheckedChange={(checked) => setValue("isGeneratedMobile", checked === true)}
                disabled={submitting}
              />
              <Label htmlFor="emp-generated-mobile" className="cursor-pointer text-sm font-normal">
                This worker doesn't have a phone number
              </Label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {!isGeneratedMobile && (
              <div className="space-y-1.5">
                <Label htmlFor="emp-phone">
                  Phone number {mode === "edit" && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="emp-phone"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  disabled={submitting}
                  {...register("phone")}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="emp-rate">Daily rate (₹)</Label>
              <Input id="emp-rate" type="number" min={0} placeholder="Optional" disabled={submitting} {...register("dailyWage")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emp-aadhar">Aadhaar number</Label>
              <Input
                id="emp-aadhar"
                inputMode="numeric"
                maxLength={12}
                placeholder="Optional"
                disabled={submitting}
                {...register("aadharNumber")}
              />
              {errors.aadharNumber && <p className="text-xs text-destructive">{errors.aadharNumber.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-site">
                Assign to site <span className="text-destructive">*</span>
              </Label>
              <Select
                name="siteId"
                value={watch("siteId")}
                onValueChange={(v) => setValue("siteId", v, { shouldValidate: true })}
                disabled={submitting || sitesLoading}
              >
                <SelectTrigger id="emp-site">
                  <SelectValue placeholder={sitesLoading ? "Loading sites..." : "Select site"} />
                </SelectTrigger>
                <SelectContent>
                  {siteOptions.map((site) => (
                    <SelectItem key={site.siteId} value={String(site.siteId)}>
                      {site.siteName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.siteId && <p className="text-xs text-destructive">{errors.siteId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emp-pan">PAN number</Label>
              <Input
                id="emp-pan"
                placeholder="Optional"
                maxLength={10}
                className="uppercase"
                disabled={submitting}
                {...register("pancard")}
              />
              {errors.pancard && <p className="text-xs text-destructive">{errors.pancard.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-parent">Father/Husband name</Label>
              <Input id="emp-parent" placeholder="Optional" disabled={submitting} {...register("parentname")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? (mode === "add" ? "Adding..." : "Updating...") : mode === "add" ? "Add employee" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
