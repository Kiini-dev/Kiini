import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ESignatures() {
  const utils = trpc.useUtils();
  const { data: requests = [], refetch } = trpc.eSignatures.list.useQuery();
  const { data: esignSettings } = trpc.settings.getByCategory.useQuery({ category: "esign_general" }, { staleTime: 60_000 });
  const signaturesEnabled = esignSettings?.enabled !== "false";
  const [token, setToken] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") || "");
  const [signerName, setSignerName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const requestQuery = trpc.eSignatures.getByToken.useQuery(token, { enabled: token.length > 20 });
  const requestCode = trpc.eSignatures.requestVerificationCode.useMutation({
    onSuccess: () => toast.success("A verification code was sent to the invited email address"),
    onError: (error) => toast.error(error.message),
  });
  const verifyCode = trpc.eSignatures.verifyCode.useMutation({
    onSuccess: async () => {
      toast.success("Email verified. You can now sign the document.");
      setVerificationCode("");
      await requestQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const sign = trpc.eSignatures.sign.useMutation({
    onSuccess: async (result) => {
      toast.success(result.nextSignerNotified
        ? "Your signature has been recorded"
        : "Your signature was recorded, but an email notification could not be delivered");
      await Promise.all([requestQuery.refetch(), utils.eSignatures.list.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const create = trpc.eSignatures.create.useMutation({
    onSuccess: () => {
      toast.success("Signing request sent to the first signer");
      setForm({ title: "", signerName: "", signerEmail: "", documentContent: "" });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });
  const [form, setForm] = useState({ title: "", signerName: "", signerEmail: "", documentContent: "" });
  useEffect(() => {
    if (requestQuery.data?.signerName && !signerName) setSignerName(requestQuery.data.signerName);
  }, [requestQuery.data?.signerName, signerName]);

  const submit = () => {
    if (!form.title || !form.signerName || !form.signerEmail || !form.documentContent) {
      toast.error("Complete all request fields");
      return;
    }
    create.mutate(form);
  };
  const request = requestQuery.data;
  const canSign = request?.status === "pending" && request.canSign && request.emailVerified;

  return <div className="max-w-6xl mx-auto p-6 space-y-6">
    <div>
      <h1 className="text-3xl font-semibold">E-Signatures</h1>
      <p className="text-muted-foreground">Collect typed electronic signatures using sequential signing, verified email, explicit consent, and an audit trail.</p>
      {!signaturesEnabled && <p className="mt-2 text-sm text-destructive">E-signatures are disabled in settings. Existing requests remain available.</p>}
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card><CardHeader><CardTitle>New Signature Request</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Document title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Signer name" value={form.signerName} onChange={e => setForm({ ...form, signerName: e.target.value })} />
          <Input type="email" placeholder="Signer email" value={form.signerEmail} onChange={e => setForm({ ...form, signerEmail: e.target.value })} />
        </div>
        <Textarea rows={10} placeholder="Document content or agreement text" value={form.documentContent} onChange={e => setForm({ ...form, documentContent: e.target.value })} />
        <Button onClick={submit} disabled={!signaturesEnabled || create.isPending}>{create.isPending ? "Sending..." : "Send for Signature"}</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Review and Sign</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Paste signing token" value={token} onChange={e => setToken(e.target.value.trim())} />
        {request && <>
          <div className="rounded-md border p-4 space-y-2">
            <p className="font-medium">{request.title}</p>
            <p className="text-sm text-muted-foreground">Invited signer: {request.signerEmail}</p>
            <p className="text-sm capitalize">Status: {request.status}</p>
            {request.documentContent && <iframe
              title={`Review ${request.title}`}
              srcDoc={request.documentContent}
              sandbox=""
              referrerPolicy="no-referrer"
              className="h-[420px] w-full rounded border bg-white"
            />}
          </div>
          {request.waitingForEarlierSigners && <p className="text-sm text-muted-foreground">This document is waiting for earlier signers to complete their steps.</p>}
          {request.requiresAccount && !request.signedByCurrentUser && <div className="space-y-2 text-sm">
            <p>This signer is a Kiini account holder. Sign in with the invited account to continue.</p>
            <Link href={`/login?redirect=${encodeURIComponent(`/e-signatures?token=${token}`)}`} className="text-primary underline">Sign in to Kiini</Link>
          </div>}
          {request.status === "pending" && request.canSign && request.signedByCurrentUser && <>
            {!request.emailVerified ? <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Verify the invited email address before signing.</p>
              <Button variant="outline" onClick={() => requestCode.mutate(token)} disabled={requestCode.isPending}>
                {requestCode.isPending ? "Sending code..." : "Email me a verification code"}
              </Button>
              <div className="flex gap-2">
                <Input aria-label="Email verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={verificationCode} onChange={event => setVerificationCode(event.target.value.replace(/\D/g, ""))} placeholder="6-digit code" />
                <Button onClick={() => verifyCode.mutate({ token, code: verificationCode })} disabled={verificationCode.length !== 6 || verifyCode.isPending}>
                  {verifyCode.isPending ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div> : <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="typed-signature">Type your full name as shown in the invitation</Label>
                <Input id="typed-signature" autoComplete="name" value={signerName} onChange={event => setSignerName(event.target.value)} />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={consentAccepted} onChange={event => setConsentAccepted(event.target.checked)} className="mt-1" />
                <span>I agree to sign this document electronically. My typed name, verified email, consent, and signing time will be recorded in the audit trail.</span>
              </label>
              <Button disabled={!signerName.trim() || !consentAccepted || sign.isPending} onClick={() => sign.mutate({ token, signerName, consentAccepted: true })}>
                {sign.isPending ? "Recording signature..." : "Sign Document"}
              </Button>
            </div>}
          </>}
          {request.status === "signed" && <p className="text-sm text-green-700">Signed by {request.typedSignature || request.signerName}{request.signedAt ? ` on ${new Date(request.signedAt).toLocaleString()}` : ""}.</p>}
          {request.status === "expired" && <p className="text-sm text-destructive">This signing request has expired.</p>}
        </>}
        {token.length > 20 && requestQuery.data === null && <p className="text-sm text-destructive">Signing request not found or no longer available.</p>}
        <p className="text-xs text-muted-foreground">External signers verify access using a one-time email code. Kiini account holders must sign in with their verified account and also verify email.</p>
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Requests</CardTitle></CardHeader><CardContent><div className="divide-y">
      {requests.map(request => <div key={request.id} className="py-3 flex items-center justify-between">
        <div><p className="font-medium">{request.title}</p><p className="text-sm text-muted-foreground">{request.signerName} · {request.signerEmail}{request.sequence > 1 ? ` · Signer ${request.sequence}` : ""}</p></div>
        <span className="text-sm capitalize">{request.status}</span>
      </div>)}
      {requests.length === 0 && <p className="py-6 text-sm text-muted-foreground">No signature requests yet.</p>}
    </div></CardContent></Card>
  </div>;
}
