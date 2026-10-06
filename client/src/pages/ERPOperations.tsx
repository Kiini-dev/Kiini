import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Boxes, Factory, GitBranch, PlugZap, Send, Settings2, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function ActionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-3">{children}</CardContent></Card>;
}

export default function ERPOperations() {
  const [warehouseId, setWarehouseId] = useState("");
  const [binCode, setBinCode] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [requisitionNumber, setRequisitionNumber] = useState("");
  const [rfqNumber, setRfqNumber] = useState("");
  const [mrpHorizon, setMrpHorizon] = useState("");
  const [eventId, setEventId] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [schedule, setSchedule] = useState("weekly");
  const utils = trpc.useUtils();
  const warehouseQuery = trpc.warehouses.list.useQuery();
  const anomalies = trpc.erpOperations.enterprise.listAnomalies.useQuery();
  const policy = trpc.erpOperations.distribution.setInventoryPolicy.useMutation({ onSuccess: () => toast.success("Inventory policy saved"), onError: (e) => toast.error(e.message) });
  const createBin = trpc.erpOperations.distribution.createBin.useMutation({ onSuccess: () => toast.success("Bin created"), onError: (e) => toast.error(e.message) });
  const createRequisition = trpc.erpOperations.distribution.createRequisition.useMutation({ onSuccess: () => { toast.success("Requisition created"); setRequisitionNumber(""); }, onError: (e) => toast.error(e.message) });
  const createRfq = trpc.erpOperations.procurement.createRfq.useMutation({ onSuccess: () => { toast.success("RFQ created"); setRfqNumber(""); }, onError: (e) => toast.error(e.message) });
  const createMrp = trpc.erpOperations.planning.runMrp.useMutation({ onSuccess: () => toast.success("MRP run completed"), onError: (e) => toast.error(e.message) });
  const reserve = trpc.erpOperations.distribution.reserveStock.useMutation({ onSuccess: () => toast.success("Stock reserved"), onError: (e) => toast.error(e.message) });
  const retry = trpc.erpOperations.enterprise.retryIntegrationEvent.useMutation({ onSuccess: () => { toast.success("Integration event queued for retry"); setEventId(""); }, onError: (e) => toast.error(e.message) });
  const scheduleReport = trpc.erpOperations.enterprise.scheduleReport.useMutation({ onSuccess: () => { toast.success("Report schedule created"); setScheduleName(""); }, onError: (e) => toast.error(e.message) });
  const selectedWarehouse = warehouseId || (warehouseQuery.data as any[])?.[0]?.id || "";

  return <ModuleLayout title="ERP Operations" description="Inventory, procurement, fulfilment, planning and integration controls" icon={<Boxes className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Operations" }, { label: "ERP Operations" }]}>
    <div className="space-y-5">
      <Tabs defaultValue="inventory">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1"><TabsTrigger value="inventory"><Boxes className="mr-2 h-4 w-4" />Inventory</TabsTrigger><TabsTrigger value="procurement"><Truck className="mr-2 h-4 w-4" />Procurement</TabsTrigger><TabsTrigger value="planning"><Factory className="mr-2 h-4 w-4" />Planning</TabsTrigger><TabsTrigger value="integrations"><PlugZap className="mr-2 h-4 w-4" />Intelligence</TabsTrigger></TabsList>
        <TabsContent value="inventory" className="grid gap-5 lg:grid-cols-2">
          <ActionCard title="Inventory policy" description="Choose valuation and enforce negative-stock rules."><div className="grid gap-3 sm:grid-cols-2"><Select defaultValue="weighted_average" onValueChange={(value) => policy.mutate({ valuationMethod: value as "weighted_average" | "fifo" | "standard_cost", allowNegativeStock: false })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weighted_average">Weighted average</SelectItem><SelectItem value="fifo">FIFO</SelectItem><SelectItem value="standard_cost">Standard cost</SelectItem></SelectContent></Select><Button onClick={() => policy.mutate({ valuationMethod: "weighted_average", allowNegativeStock: false })}><Settings2 className="mr-2 h-4 w-4" />Save policy</Button></div></ActionCard>
          <ActionCard title="Warehouse bin" description="Add a controlled storage location to an existing warehouse."><Select value={selectedWarehouse} onValueChange={setWarehouseId}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{((warehouseQuery.data as any[]) || []).map((warehouse) => <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>)}</SelectContent></Select><div className="flex gap-2"><Input placeholder="Bin code" value={binCode} onChange={(e) => setBinCode(e.target.value)} /><Button disabled={!selectedWarehouse || !binCode} onClick={() => createBin.mutate({ warehouseId: selectedWarehouse, code: binCode })}>Create bin</Button></div></ActionCard>
          <ActionCard title="Reserve stock" description="Reserve stock against a sales order, project or fulfilment request."><div className="grid gap-2 sm:grid-cols-3"><Input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} /><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /><Button disabled={!productId} onClick={() => reserve.mutate({ productId, warehouseId: selectedWarehouse || undefined, sourceType: "manual", sourceId: `reservation-${Date.now()}`, quantity: Number(quantity) })}>Reserve</Button></div></ActionCard>
        </TabsContent>
        <TabsContent value="procurement" className="grid gap-5 lg:grid-cols-2">
          <ActionCard title="Purchase requisition" description="Start a controlled requisition before issuing a purchase order."><div className="flex gap-2"><Input placeholder="Requisition number" value={requisitionNumber} onChange={(e) => setRequisitionNumber(e.target.value)} /><Button disabled={!requisitionNumber} onClick={() => createRequisition.mutate({ requisitionNumber, lines: [{ productId: productId || "unspecified", quantity: Number(quantity) || 1 }] })}>Create requisition</Button></div></ActionCard>
          <ActionCard title="Request for quotation" description="Collect supplier quotations and award the best response."><div className="flex gap-2"><Input placeholder="RFQ number" value={rfqNumber} onChange={(e) => setRfqNumber(e.target.value)} /><Button disabled={!rfqNumber} onClick={() => createRfq.mutate({ rfqNumber })}><Send className="mr-2 h-4 w-4" />Create RFQ</Button></div></ActionCard>
          <ActionCard title="Procurement controls" description="The API now supports landed cost, supplier returns, quote comparison and three-way matching."><div className="flex flex-wrap gap-2"><Badge variant="outline">RFQ</Badge><Badge variant="outline">Supplier quotes</Badge><Badge variant="outline">Landed cost</Badge><Badge variant="outline">PO / receipt / invoice match</Badge></div></ActionCard>
        </TabsContent>
        <TabsContent value="planning" className="grid gap-5 lg:grid-cols-2">
          <ActionCard title="Material requirements planning" description="Run a demand and lead-time planning cycle and create recommendations."><div className="flex gap-2"><Input type="date" value={mrpHorizon} onChange={(e) => setMrpHorizon(e.target.value)} /><Button disabled={!mrpHorizon} onClick={() => createMrp.mutate({ horizonDate: mrpHorizon, recommendations: productId ? [{ productId, requiredDate: mrpHorizon, quantity: Number(quantity) || 1, sourceType: "manual" }] : [] })}><GitBranch className="mr-2 h-4 w-4" />Run MRP</Button></div></ActionCard>
          <ActionCard title="Production and quality" description="BOMs, routings, production orders, cost capture and nonconformance APIs are available under the ERP operations namespace."><div className="flex flex-wrap gap-2"><Badge variant="outline">BOM revisions</Badge><Badge variant="outline">Routings</Badge><Badge variant="outline">WIP consumption</Badge><Badge variant="outline">Quality issues</Badge></div></ActionCard>
        </TabsContent>
        <TabsContent value="integrations" className="grid gap-5 lg:grid-cols-2">
          <ActionCard title="Retry integration event" description="Requeue a failed event with an auditable attempt record."><div className="flex gap-2"><Input placeholder="Integration event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} /><Button disabled={!eventId} onClick={() => retry.mutate({ eventId })}>Retry</Button></div></ActionCard>
          <ActionCard title="Schedule a report" description="Create a recurring report definition for finance or operations."><div className="grid gap-2 sm:grid-cols-3"><Input placeholder="Report name" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} /><Select value={schedule} onValueChange={setSchedule}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select><Button disabled={!scheduleName} onClick={() => scheduleReport.mutate({ name: scheduleName, reportType: "operations", schedule, recipients: [] })}>Schedule</Button></div></ActionCard>
          <ActionCard title="Open anomaly alerts" description="Recent alerts generated by governed KPI and integration processes."><div className="space-y-2">{((anomalies.data as any[]) || []).slice(0, 5).map((alert) => <div key={alert.id} className="flex items-center justify-between rounded border p-2 text-sm"><span>{alert.message}</span><Badge>{alert.severity}</Badge></div>)}{!anomalies.data?.length && <p className="text-sm text-muted-foreground">No open anomaly alerts.</p>}</div></ActionCard>
        </TabsContent>
      </Tabs>
    </div>
  </ModuleLayout>;
}
