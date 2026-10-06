import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

type CannedResponse = {
  id: string;
  title: string;
  content: string;
  category: string;
};

type CannedResponsePickerProps = {
  onSelect: (response: CannedResponse) => void;
  format?: "html" | "text";
  includeTicketSettings?: boolean;
  disabled?: boolean;
};

export function cannedResponseToText(html: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  parsed.querySelectorAll("br").forEach(element => element.replaceWith("\n"));
  parsed.querySelectorAll("li").forEach(element => {
    element.prepend(parsed.createTextNode("- "));
    element.append(parsed.createTextNode("\n"));
  });
  parsed.querySelectorAll("p,div,h1,h2,h3,h4,h5,h6,tr").forEach(element => {
    element.append(parsed.createTextNode("\n"));
  });
  return (parsed.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function appendCannedResponse(current: string, inserted: string, format: "html" | "text" = "text") {
  const existing = current.trimEnd();
  if (!existing) return inserted;
  if (format === "text") return `${existing}\n\n${inserted}`;

  const container = document.createElement("div");
  container.innerHTML = existing;
  const responseContainer = document.createElement("div");
  responseContainer.innerHTML = inserted;
  container.append(document.createElement("p"));
  while (responseContainer.firstChild) container.append(responseContainer.firstChild);
  return container.innerHTML;
}

export function CannedResponsePicker({
  onSelect,
  format = "html",
  includeTicketSettings = false,
  disabled = false,
}: CannedResponsePickerProps) {
  const [selectedId, setSelectedId] = useState("");
  const responsesQuery = trpc.cannedResponses.list.useQuery(undefined, {
    staleTime: 60_000,
    retry: false,
  });
  const ticketSettingsQuery = trpc.settings.getByCategory.useQuery(
    { category: "ticket_canned" },
    { enabled: includeTicketSettings, staleTime: 60_000, retry: false },
  );

  const responses = useMemo(() => {
    const saved = (responsesQuery.data || []).map(response => ({
      id: response.id,
      title: response.title,
      content: response.content,
      category: response.category || "General",
    }));
    if (!includeTicketSettings) return saved;

    const list = ticketSettingsQuery.data?.list;
    if (!list) return saved;
    try {
      const legacy = JSON.parse(list);
      if (!Array.isArray(legacy)) throw new Error("Expected a list of ticket responses.");
      return [
        ...saved,
        ...legacy
          .filter(item => item && typeof item.name === "string" && typeof item.body === "string")
          .map(item => ({
            id: `ticket-setting:${String(item.id || item.name)}`,
            title: item.name,
            content: item.body,
            category: "Ticket settings",
          })),
      ];
    } catch (error) {
      console.error("[CannedResponsePicker] Invalid ticket canned-response settings:", error);
      return saved;
    }
  }, [includeTicketSettings, responsesQuery.data, ticketSettingsQuery.data?.list]);

  useEffect(() => {
    if (responsesQuery.error) toast.error(`Could not load canned responses: ${responsesQuery.error.message}`);
  }, [responsesQuery.error]);

  useEffect(() => {
    if (ticketSettingsQuery.error) {
      toast.error(`Could not load ticket canned responses: ${ticketSettingsQuery.error.message}`);
    }
  }, [ticketSettingsQuery.error]);

  function insertSelectedResponse(id: string) {
    setSelectedId("");
    const response = responses.find(item => item.id === id);
    if (!response) return;
    onSelect({
      ...response,
      content: format === "text" ? cannedResponseToText(response.content) : response.content,
    });
  }

  const isLoading = responsesQuery.isLoading || (includeTicketSettings && ticketSettingsQuery.isLoading);
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedId} onValueChange={insertSelectedResponse} disabled={disabled || isLoading || responses.length === 0}>
        <SelectTrigger className="w-full min-w-52">
          <SelectValue placeholder={isLoading ? "Loading saved replies…" : responses.length ? "Choose a canned response" : "No canned responses"} />
        </SelectTrigger>
        <SelectContent>
          {responses.map(response => (
            <SelectItem key={response.id} value={response.id}>
              {response.category} · {response.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {responsesQuery.error && (
        <Button type="button" variant="outline" size="sm" onClick={() => responsesQuery.refetch()}>
          Retry
        </Button>
      )}
    </div>
  );
}
