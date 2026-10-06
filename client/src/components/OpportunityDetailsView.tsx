import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { useCurrencySettings } from "@/lib/currency";
import { Building2, CalendarDays, CheckCircle2, Clock3, Download, Edit, Mail, Target, Trash2, UserRound } from "lucide-react";

const PIPELINE_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed won" },
];

function normalizeStage(stage: string) {
  if (stage === "prospecting") return "lead";
  if (stage === "qualification") return "qualified";
  return stage;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
}

export interface OpportunityDetailRecord {
  id: string;
  title?: string | null;
  name?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  value?: number | null;
  currency?: string | null;
  stage?: string | null;
  probability?: number | null;
  expectedCloseDate?: string | Date | null;
  actualCloseDate?: string | Date | null;
  stageMovedAt?: string | Date | null;
  assignedToName?: string | null;
  assignedTo?: string | null;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  winReason?: string | null;
  lossReason?: string | null;
  createdAt?: string | Date | null;
}

interface OpportunityDetailsViewProps {
  opportunity: OpportunityDetailRecord;
  entityLabel?: "Opportunity" | "Proposal";
  clientHref?: string;
  onEdit: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
  onConvert?: () => void;
  isDeleting?: boolean;
}

export function OpportunityDetailsView({
  opportunity,
  entityLabel = "Opportunity",
  clientHref,
  onEdit,
  onDelete,
  onDownload,
  onEmail,
  onConvert,
  isDeleting = false,
}: OpportunityDetailsViewProps) {
  const { code } = useCurrencySettings();
  const stage = normalizeStage(opportunity.stage || "lead");
  const stageIndex = PIPELINE_STAGES.findIndex((item) => item.value === stage);
  const isLost = stage === "closed_lost";
  const probability = Math.max(0, Math.min(100, Number(opportunity.probability || 0)));
  const title = opportunity.title || opportunity.name || `${entityLabel} ${opportunity.id.slice(-8)}`;
  const clientName = opportunity.clientName || (opportunity.clientId ? "Client record unavailable" : "No client linked");
  const value = Number(opportunity.value || 0) / 100;
  const formattedValue = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: opportunity.currency || code,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={stage === "closed_won" ? "default" : isLost ? "destructive" : "secondary"}>
              {PIPELINE_STAGES.find((item) => item.value === stage)?.label || stage.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{entityLabel} · {opportunity.id}</span>
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Client: {clientHref && opportunity.clientId ? <a className="font-medium text-primary hover:underline" href={clientHref}>{clientName}</a> : <span className="font-medium text-foreground">{clientName}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onDownload && <Button variant="outline" onClick={onDownload}><Download className="mr-2 h-4 w-4" />Download</Button>}
          {onEmail && <Button variant="outline" onClick={onEmail}><Mail className="mr-2 h-4 w-4" />Send</Button>}
          {onConvert && <Button variant="outline" onClick={onConvert}>Create quote</Button>}
          <Button onClick={onEdit}><Edit className="mr-2 h-4 w-4" />Edit</Button>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Deal summary">
        <Card><CardContent className="flex items-center gap-3 p-4"><Target className="h-5 w-5 text-emerald-600" /><div><p className="text-xs text-muted-foreground">Deal value</p><p className="text-lg font-semibold">{formattedValue}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle2 className="h-5 w-5 text-blue-600" /><div className="w-full"><div className="flex justify-between gap-2"><p className="text-xs text-muted-foreground">Win probability</p><p className="text-sm font-semibold">{probability}%</p></div><div className="mt-2 h-1.5 overflow-hidden rounded bg-muted"><div className="h-full bg-blue-600" style={{ width: `${probability}%` }} /></div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CalendarDays className="h-5 w-5 text-amber-600" /><div><p className="text-xs text-muted-foreground">Expected close</p><p className="text-sm font-semibold">{formatDate(opportunity.expectedCloseDate)}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Clock3 className="h-5 w-5 text-violet-600" /><div><p className="text-xs text-muted-foreground">Last stage change</p><p className="text-sm font-semibold">{formatDate(opportunity.stageMovedAt)}</p></div></CardContent></Card>
      </section>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Pipeline progress</CardTitle><CardDescription>Current position and close outcome</CardDescription></CardHeader>
        <CardContent>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PIPELINE_STAGES.map((item, index) => {
              const complete = !isLost && stageIndex >= index;
              const current = !isLost && stageIndex === index;
              return <li key={item.value} className="flex items-center gap-2 text-sm">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs ${current ? "border-primary bg-primary text-primary-foreground" : complete ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/30 text-muted-foreground"}`}>
                  {complete && !current ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span className={current ? "font-semibold" : "text-muted-foreground"}>{item.label}</span>
              </li>;
            })}
          </ol>
          {isLost && <p className="mt-4 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Closed lost{opportunity.lossReason ? `: ${opportunity.lossReason}` : "."}</p>}
          {stage === "closed_won" && <p className="mt-4 rounded border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm text-emerald-700">Closed won{opportunity.winReason ? `: ${opportunity.winReason}` : "."}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Scope and description</CardTitle></CardHeader>
            <CardContent>{opportunity.description ? <RichTextDisplay html={opportunity.description} /> : <p className="text-sm text-muted-foreground">No description provided.</p>}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>{opportunity.notes ? <RichTextDisplay html={opportunity.notes} /> : <p className="text-sm text-muted-foreground">No notes recorded.</p>}</CardContent>
          </Card>
        </div>
        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" />Client</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Company</p><p className="font-medium">{clientName}</p></div>
              {opportunity.clientEmail && <div><p className="text-xs text-muted-foreground">Email</p><a href={`mailto:${opportunity.clientEmail}`} className="break-all text-primary hover:underline">{opportunity.clientEmail}</a></div>}
              {opportunity.clientPhone && <div><p className="text-xs text-muted-foreground">Phone</p><a href={`tel:${opportunity.clientPhone}`} className="text-primary hover:underline">{opportunity.clientPhone}</a></div>}
              {opportunity.clientId && <div><p className="text-xs text-muted-foreground">Client ID</p><p className="break-all">{opportunity.clientId}</p></div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-4 w-4" />Deal details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{opportunity.assignedToName || opportunity.assignedTo || "Unassigned"}</p></div>
              <div><p className="text-xs text-muted-foreground">Source</p><p className="font-medium">{opportunity.source || "Not recorded"}</p></div>
              <div><p className="text-xs text-muted-foreground">Actual close</p><p className="font-medium">{formatDate(opportunity.actualCloseDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(opportunity.createdAt)}</p></div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}