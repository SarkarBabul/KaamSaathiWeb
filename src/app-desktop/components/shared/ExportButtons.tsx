import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/app-desktop/utils/downloadBlob";
import { ApiError } from "@/app-desktop/api/httpClient";

interface ExportButtonsProps {
  disabled: boolean;
  disabledReason?: string;
  fetchPdf: () => Promise<Blob>;
  fetchExcel: () => Promise<Blob>;
  filenameBase: string;
}

type ExportKind = "pdf" | "excel" | null;

// Both exports are server-generated file streams (no client-side PDF/Excel
// generation involved) — matches the Angular source exactly, which only
// creates an object URL over the returned blob and clicks a synthetic <a>.
export function ExportButtons({ disabled, disabledReason, fetchPdf, fetchExcel, filenameBase }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<ExportKind>(null);

  const runExport = async (kind: Exclude<ExportKind, null>, fetcher: () => Promise<Blob>, extension: string) => {
    setExporting(kind);
    try {
      const blob = await fetcher();
      downloadBlob(blob, `${filenameBase}.${extension}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex items-center gap-2" title={disabled ? disabledReason : undefined}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || exporting !== null}
        onClick={() => runExport("pdf", fetchPdf, "pdf")}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {exporting === "pdf" ? "Exporting…" : "Export PDF"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || exporting !== null}
        onClick={() => runExport("excel", fetchExcel, "xlsx")}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {exporting === "excel" ? "Exporting…" : "Export Excel"}
      </Button>
    </div>
  );
}
