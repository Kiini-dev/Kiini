import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/RichTextEditor";
import { appendCannedResponse, CannedResponsePicker, cannedResponseToText } from "@/components/CannedResponsePicker";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Send } from "lucide-react";

export function TicketReplyComposer({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const utils = trpc.useUtils();
  const addComment = trpc.tickets.addComment.useMutation({
    onSuccess: async () => {
      setBody("");
      await utils.tickets.getById.invalidate(ticketId);
      toast.success("Ticket reply added");
    },
    onError: error => toast.error(`Could not send ticket reply: ${error.message}`),
  });

  function submitReply() {
    if (!cannedResponseToText(body).trim()) {
      toast.error("Write a reply before sending");
      return;
    }
    addComment.mutate({ ticketId, body });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Reply to ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CannedResponsePicker
          includeTicketSettings
          onSelect={response => setBody(current => appendCannedResponse(current, response.content, "html"))}
        />
        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Write a reply to this ticket…"
          minHeight="140px"
        />
        <Button onClick={submitReply} disabled={addComment.isPending}>
          {addComment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send reply
        </Button>
      </CardContent>
    </Card>
  );
}
