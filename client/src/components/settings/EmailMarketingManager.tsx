import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type CampaignDraft = {
  id?: string;
  campaignName: string;
  subject: string;
  bodyHtml: string;
};

export function EmailMarketingCampaignManager() {
  const utils = trpc.useUtils();
  const campaigns = trpc.emailMarketing.listCampaigns.useQuery();
  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const saveDraft = trpc.emailMarketing.saveDraft.useMutation({
    onSuccess: async () => {
      toast.success("Campaign draft saved");
      setDraft(null);
      await utils.emailMarketing.listCampaigns.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const sendNow = trpc.emailMarketing.sendNow.useMutation({
    onSuccess: async (result) => {
      toast.success(`Queued ${result.queued} opted-in subscriber${result.queued === 1 ? "" : "s"}${result.failed ? `; ${result.failed} could not be queued` : ""}`);
      await utils.emailMarketing.listCampaigns.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Campaigns are sent only to subscribers with recorded opt-in consent who have not unsubscribed. Campaign sending is manual; scheduling is not enabled.
      </p>
      <div className="space-y-2">
        {campaigns.isLoading ? <p className="text-sm text-muted-foreground">Loading campaigns…</p> : null}
        {campaigns.error ? <p role="alert" className="text-sm text-destructive">{campaigns.error.message}</p> : null}
        {campaigns.data?.map((campaign: any) => (
          <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{campaign.campaignName}</p>
              <p className="text-xs text-muted-foreground">{campaign.subject} · {campaign.recipientCount || 0} recipient(s) · {campaign.sentCount || 0} sent · {campaign.failureCount || 0} failed</p>
            </div>
            <div className="flex gap-2">
              <span className="self-center rounded bg-muted px-2 py-1 text-xs capitalize">{campaign.status}</span>
              {campaign.status === "draft" ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setDraft({
                    id: campaign.id,
                    campaignName: campaign.campaignName,
                    subject: campaign.subject,
                    bodyHtml: campaign.bodyHtml,
                  })}>Edit</Button>
                  <Button size="sm" disabled={sendNow.isPending} onClick={() => {
                    if (window.confirm(`Queue “${campaign.campaignName}” for all eligible opted-in subscribers now?`)) {
                      sendNow.mutate({ id: campaign.id, confirm: true });
                    }
                  }}>Send now</Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
        {!campaigns.isLoading && !campaigns.data?.length ? <p className="text-sm text-muted-foreground">No campaigns yet.</p> : null}
      </div>
      <Button onClick={() => setDraft({ campaignName: "", subject: "", bodyHtml: "" })}>Create campaign</Button>
      {draft ? (
        <div className="space-y-3 rounded-md border p-4">
          <div>
            <label htmlFor="campaign-name" className="mb-1 block text-sm font-medium">Campaign name</label>
            <Input id="campaign-name" value={draft.campaignName} onChange={(event) => setDraft({ ...draft, campaignName: event.target.value })} maxLength={255} />
          </div>
          <div>
            <label htmlFor="campaign-subject" className="mb-1 block text-sm font-medium">Subject</label>
            <Input id="campaign-subject" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} maxLength={500} />
          </div>
          <div>
            <label htmlFor="campaign-body" className="mb-1 block text-sm font-medium">HTML body</label>
            <Textarea id="campaign-body" value={draft.bodyHtml} onChange={(event) => setDraft({ ...draft, bodyHtml: event.target.value })} rows={10} className="font-mono text-xs" />
          </div>
          <p className="text-xs text-muted-foreground">Available merge fields: {"{first_name}"}, {"{last_name}"}, {"{campaign_name}"}, {"{unsubscribe_url}"}, {"{dashboard_url}"}.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button disabled={saveDraft.isPending} onClick={() => saveDraft.mutate(draft)}>Save draft</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function EmailMarketingSubscriberManager() {
  const utils = trpc.useUtils();
  const subscribers = trpc.emailMarketing.listSubscribers.useQuery();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const addSubscriber = trpc.emailMarketing.addSubscriber.useMutation({
    onSuccess: async () => {
      toast.success("Opted-in subscriber added");
      setEmail("");
      setName("");
      setConsentConfirmed(false);
      await utils.emailMarketing.listSubscribers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const removeSubscriber = trpc.emailMarketing.removeSubscriber.useMutation({
    onSuccess: async () => {
      toast.success("Subscriber removed from campaign eligibility");
      await utils.emailMarketing.listSubscribers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">Add a contact only after receiving and recording their explicit consent. Removal prevents future campaign sends.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="subscriber-name" className="mb-1 block text-sm font-medium">Name (optional)</label>
          <Input id="subscriber-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <label htmlFor="subscriber-email" className="mb-1 block text-sm font-medium">Email address</label>
          <Input id="subscriber-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} />
        <span>I confirm this contact explicitly opted in to marketing emails and consent has been recorded.</span>
      </label>
      <Button disabled={!consentConfirmed || !email || addSubscriber.isPending} onClick={() => addSubscriber.mutate({ email, name: name || undefined, consentConfirmed: true })}>Add opted-in subscriber</Button>
      {subscribers.error ? <p role="alert" className="text-sm text-destructive">{subscribers.error.message}</p> : null}
      <div className="space-y-2">
        {subscribers.data?.map((subscriber: any) => (
          <div key={subscriber.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{subscriber.name || subscriber.email}</p>
              {subscriber.name ? <p className="text-xs text-muted-foreground">{subscriber.email}</p> : null}
              <p className="text-xs text-muted-foreground">{subscriber.optedIn && !subscriber.unsubscribedAt ? "Opted in" : "Unsubscribed"} · consent recorded {new Date(subscriber.consentAt).toLocaleDateString()}</p>
            </div>
            {subscriber.optedIn && !subscriber.unsubscribedAt ? <Button variant="outline" size="sm" disabled={removeSubscriber.isPending} onClick={() => removeSubscriber.mutate({ id: subscriber.id })}>Remove</Button> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
