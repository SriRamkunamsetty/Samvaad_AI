import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Share2, FileText, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { exportSamvaadPDF, ExportPayload } from "@/services/exportPdf";
import { createShareLink } from "@/services/runs";
import { toast } from "sonner";

export function ExportMenu({ payload, label = "Export" }: { payload: ExportPayload; label?: string }) {
  const [busy, setBusy] = useState<"pdf" | "share" | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const onPdf = () => {
    setBusy("pdf");
    try {
      exportSamvaadPDF({ ...payload, generatedAt: new Date().toISOString() }, "samvaad-report.pdf");
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e.message || "Failed to export PDF");
    } finally { setBusy(null); }
  };

  const onShare = async () => {
    setBusy("share");
    try {
      const id = await createShareLink({ ...payload, generatedAt: new Date().toISOString() });
      if (!id) throw new Error("Could not create link");
      const url = `${window.location.origin}/share/${id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      toast.success("Share link copied to clipboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to create link");
    } finally { setBusy(null); }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-border/60 glass-subtle">
          <Download className="h-3.5 w-3.5 mr-1.5" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 glass-strong border-border/60 p-2">
        <button
          onClick={onPdf}
          disabled={busy !== null}
          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left disabled:opacity-50"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-primary/20 border border-primary/20 grid place-items-center shrink-0">
            {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <div className="text-sm font-medium">Download PDF</div>
            <div className="text-xs text-muted-foreground">Branded report with reasoning + timeline</div>
          </div>
        </button>
        <button
          onClick={onShare}
          disabled={busy !== null}
          className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left disabled:opacity-50"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-primary/20 border border-primary/20 grid place-items-center shrink-0">
            {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4 text-primary" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{copied ? "Copied!" : "Create share link"}</div>
            <div className="text-xs text-muted-foreground truncate">
              {shareUrl ?? "Public read-only link, anyone with it can view"}
            </div>
          </div>
        </button>
        {shareUrl && (
          <div className="mt-2 p-2 rounded-lg glass-subtle flex items-center gap-2">
            <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-transparent text-xs outline-none truncate"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
