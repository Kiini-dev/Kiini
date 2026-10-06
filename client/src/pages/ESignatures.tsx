import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function SignaturePad({ onChange }: { onChange: (data: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.strokeStyle = "#17202a";
    context.lineWidth = 2;
    context.lineCap = "round";
    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
    };
    const start = (event: PointerEvent) => { drawing.current = true; const p = point(event); context.beginPath(); context.moveTo(p.x, p.y); };
    const move = (event: PointerEvent) => { if (!drawing.current) return; const p = point(event); context.lineTo(p.x, p.y); context.stroke(); onChange(canvas.toDataURL("image/png")); };
    const stop = () => { drawing.current = false; };
    canvas.addEventListener("pointerdown", start); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointerleave", stop);
    return () => { canvas.removeEventListener("pointerdown", start); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", stop); canvas.removeEventListener("pointerleave", stop); };
  }, [onChange]);
  return <canvas ref={canvasRef} width={900} height={220} className="w-full h-44 border rounded-md bg-white touch-none" aria-label="Signature drawing area" />;
}

export default function ESignatures() {
  const { data: requests = [], refetch } = trpc.eSignatures.list.useQuery();
  const { data: esignSettings } = trpc.settings.getByCategory.useQuery({ category: "esign_general" }, { staleTime: 60_000 });
  const signaturesEnabled = esignSettings?.enabled !== "false";
  const [token, setToken] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") || "");
  const [signatureData, setSignatureData] = useState("");
  const [signerName, setSignerName] = useState("");
  const requestQuery = trpc.eSignatures.getByToken.useQuery(token, { enabled: token.length > 20 });
  const sign = trpc.eSignatures.sign.useMutation({ onSuccess: () => { toast.success("Document signed successfully"); setToken(""); setSignatureData(""); requestQuery.refetch(); }, onError: (error) => toast.error(error.message) });
  const create = trpc.eSignatures.create.useMutation({ onSuccess: (result) => { toast.success(`Request created. Signing link token: ${result.signingToken}`); refetch(); }, onError: (error) => toast.error(error.message) });
  const [form, setForm] = useState({ title: "", signerName: "", signerEmail: "", documentContent: "" });
  const submit = () => { if (!form.title || !form.signerName || !form.signerEmail || !form.documentContent) return toast.error("Complete all request fields"); create.mutate(form); };
  return <div className="max-w-6xl mx-auto p-6 space-y-6">
    <div><h1 className="text-3xl font-semibold">E-Signatures</h1><p className="text-muted-foreground">Create signing requests and collect an auditable signature in the app.</p>{!signaturesEnabled && <p className="mt-2 text-sm text-destructive">E-signatures are disabled in settings. Existing requests remain available.</p>}</div>
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card><CardHeader><CardTitle>New Signature Request</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Document title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3"><Input placeholder="Signer name" value={form.signerName} onChange={e => setForm({ ...form, signerName: e.target.value })} /><Input type="email" placeholder="Signer email" value={form.signerEmail} onChange={e => setForm({ ...form, signerEmail: e.target.value })} /></div>
        <Textarea rows={10} placeholder="Document content or agreement text" value={form.documentContent} onChange={e => setForm({ ...form, documentContent: e.target.value })} />
        <Button onClick={submit} disabled={!signaturesEnabled || create.isPending}>{create.isPending ? "Creating..." : "Create Signing Request"}</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Sign a Request</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Paste signing token" value={token} onChange={e => setToken(e.target.value.trim())} />
        {requestQuery.data && <div className="rounded-md border p-4 space-y-2"><p className="font-medium">{requestQuery.data.title}</p><p className="whitespace-pre-wrap text-sm">{requestQuery.data.documentContent}</p><Input placeholder="Your full name" value={signerName} onChange={e => setSignerName(e.target.value)} /><SignaturePad onChange={setSignatureData} /><Button disabled={!signatureData || !signerName || sign.isPending} onClick={() => sign.mutate({ token, signerName, signatureData })}>{sign.isPending ? "Signing..." : "Sign Document"}</Button></div>}
        {token.length > 20 && requestQuery.data === null && <p className="text-sm text-destructive">Signing request not found or no longer available.</p>}
        <p className="text-xs text-muted-foreground">Signing links are issued per request and can be shared with the signer.</p>
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Requests</CardTitle></CardHeader><CardContent><div className="divide-y">{requests.map(request => <div key={request.id} className="py-3 flex items-center justify-between"><div><p className="font-medium">{request.title}</p><p className="text-sm text-muted-foreground">{request.signerName} · {request.signerEmail}</p></div><span className="text-sm capitalize">{request.status}</span></div>)}{requests.length === 0 && <p className="py-6 text-sm text-muted-foreground">No signature requests yet.</p>}</div></CardContent></Card>
  </div>;
}
