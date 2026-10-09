import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_BRANDING = { letterheadHtml: "", letterheadImage: "" };

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Unable to read the selected image"));
    reader.onerror = () => reject(new Error("Unable to read the selected image"));
    reader.readAsDataURL(file);
  });
}

export function DocumentBrandingSettings() {
  const utils = trpc.useUtils();
  const { data: savedBranding } = trpc.settings.getByCategory.useQuery({ category: "document_branding" });
  const [branding, setBranding] = useState(EMPTY_BRANDING);
  const saveBranding = trpc.settings.updateDocumentBranding.useMutation({
    onSuccess: async () => {
      await utils.settings.getByCategory.invalidate({ category: "document_branding" });
      toast.success("Document letterhead saved");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (savedBranding) {
      setBranding({
        letterheadHtml: savedBranding.letterheadHtml || "",
        letterheadImage: savedBranding.letterheadImage || "",
      });
    }
  }, [savedBranding]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.type === "text/html" || /\.html?$/i.test(file.name)) {
      if (file.size > 500_000) {
        toast.error("HTML letterhead must be smaller than 500 KB");
        return;
      }
      try {
        setBranding({ letterheadHtml: await file.text(), letterheadImage: "" });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to read the HTML file");
      }
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose an HTML, PNG, JPEG, or WebP letterhead");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Letterhead image must be smaller than 2 MB");
      return;
    }
    try {
      setBranding({ letterheadHtml: "", letterheadImage: await readImageAsDataUrl(file) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to read the image");
    }
  };

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">Document letterhead</h3>
        <p className="text-sm text-muted-foreground">
          This company-specific letterhead is applied to generated document exports. It overrides the app default.
        </p>
      </div>
      <label className="block space-y-2 text-sm font-medium">
        Upload HTML or image
        <input
          type="file"
          accept=".html,.htm,text/html,image/png,image/jpeg,image/webp"
          onChange={handleUpload}
          className="block w-full text-sm font-normal"
          aria-label="Upload company document letterhead"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        HTML up to 500 KB or PNG/JPEG/WebP up to 2 MB. Uploading one format replaces the other.
      </p>
      {branding.letterheadImage && (
        <img
          src={branding.letterheadImage}
          alt="Current document letterhead"
          className="max-h-24 max-w-full border bg-white object-contain p-2"
        />
      )}
      <Textarea
        value={branding.letterheadHtml}
        onChange={(event) => setBranding((current) => ({ ...current, letterheadHtml: event.target.value, letterheadImage: "" }))}
        placeholder="<header><strong>{{COMPANY_NAME}}</strong><br>{{COMPANY_ADDRESS}}</header>"
        rows={6}
        maxLength={500_000}
        aria-label="Document letterhead HTML"
        className="font-mono text-xs"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => saveBranding.mutate(branding)}
          disabled={saveBranding.isPending}
        >
          {saveBranding.isPending ? "Saving…" : "Save letterhead"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => saveBranding.mutate(EMPTY_BRANDING, {
            onSuccess: () => setBranding(EMPTY_BRANDING),
          })}
          disabled={saveBranding.isPending || (!branding.letterheadHtml && !branding.letterheadImage)}
        >
          Use app default
        </Button>
      </div>
    </section>
  );
}
