// ISO YYYY-MM-DD strings sort lexicographically, so plain string comparison
// is a valid start<=end check without parsing to Date objects.
export function isValidDateRange(start: string | null | undefined, end: string | null | undefined): boolean {
  if (!start || !end) return false;
  return start <= end;
}
