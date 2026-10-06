import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Edit,
  UserCheck,
  Clock,
  Umbrella,
  Award,
  Star,
  Trash2,
  User,
  FolderKanban,
  CheckSquare,
  FileText,
  Timer,
  Activity,
  ShieldAlert,
  ArrowRightLeft,
  Upload,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { payrollCentsToCurrency } from "@/lib/payrollCurrency";
import { Separator } from "@/components/ui/separator";
import { useFavorite } from "@/hooks/useFavorite";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeDetails() {
  const params = useRoute("/employees/:id")[1];
  const [, navigate] = useLocation();
  const employeeId = params?.id ?? "";

  // Fetch employee from backend
  const { data: employeeData, isLoading: employeeLoading } = trpc.employees.getById.useQuery(employeeId);
  const { formatAmount } = useCurrencySettings();
  const { isStarred, toggleStar } = useFavorite("employee", employeeId, (employeeData as any)?.name);
  const { data: jobGroupsData = [] as any[] } = trpc.jobGroups.list.useQuery();
  const { data: departmentsData = [] } = trpc.departments.list.useQuery({});
  
  // Fetch payroll data from backend
  const { data: payrollData, isLoading: payrollLoading } = trpc.payslips.listAll.useQuery(
    { employeeId },
    { enabled: !!employeeId, staleTime: 60000 }
  );
  
  // Fetch leave data from backend
  const { data: leaveData, isLoading: leaveLoading } = trpc.leave.byEmployee.useQuery(
    { employeeId },
    { enabled: !!employeeId, staleTime: 60000 }
  );
  
  // Fetch attendance data
  const { data: attendanceData, isLoading: attendanceLoading } = trpc.attendance.byEmployee.useQuery(
    { employeeId },
    { enabled: !!employeeId, staleTime: 60000 }
  );
  const { data: relatedData } = trpc.employees.getRelatedData.useQuery(
    { employeeId },
    { enabled: !!employeeId, staleTime: 60000 }
  );
  const { data: disciplinaryRecords = [], refetch: refetchDiscipline } = trpc.employees.disciplinary.list.useQuery({ employeeId }, { enabled: !!employeeId });
  const { data: departmentMovements = [], refetch: refetchMovements } = trpc.employees.transfers.list.useQuery({ employeeId }, { enabled: !!employeeId });
  const { data: projectsData = [] } = trpc.projects.list.useQuery({});
  const utils = trpc.useUtils();
  const openPayslip = (htmlContent: string) => {
    const printWindow = window.open("", "_blank", "width=900,height=1100");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [disciplineDialogOpen, setDisciplineDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", projectId: "", priority: "medium" });
  const [projectForm, setProjectForm] = useState({ projectId: "", role: "", hoursAllocated: "" });
  const [documentForm, setDocumentForm] = useState({ name: "", documentType: "other", fileData: "", mimeType: "application/octet-stream", size: 0 });
  const [contractForm, setContractForm] = useState({ contractNumber: "", title: "", startDate: "", endDate: "", objectives: "", terms: "", status: "draft" });
  const [disciplineForm, setDisciplineForm] = useState({ actionType: "written_warning", severity: "medium", incidentDate: new Date().toISOString().slice(0, 10), description: "", actionTaken: "" });
  const [transferForm, setTransferForm] = useState({ toDepartment: "", effectiveDate: new Date().toISOString().slice(0, 10), reason: "" });
  const [promotionForm, setPromotionForm] = useState({ newJobGroupId: "", newSalary: "", effectiveDate: new Date().toISOString().slice(0, 10), notes: "" });
  const createTask = trpc.projects.tasks.create.useMutation({ onSuccess: () => { setTaskDialogOpen(false); setTaskForm({ title: "", description: "", projectId: "", priority: "medium" }); utils.employees.getRelatedData.invalidate({ employeeId }); } });
  const addProjectMember = trpc.projects.teamMembers.create.useMutation({ onSuccess: () => { setProjectDialogOpen(false); setProjectForm({ projectId: "", role: "", hoursAllocated: "" }); utils.employees.getRelatedData.invalidate({ employeeId }); } });
  const uploadDocument = trpc.fileStorage.uploadDocument.useMutation({ onSuccess: () => { setDocumentDialogOpen(false); setDocumentForm({ name: "", documentType: "other", fileData: "", mimeType: "application/octet-stream", size: 0 }); utils.employees.getRelatedData.invalidate({ employeeId }); } });
  const updateEmployeePhoto = trpc.employees.update.useMutation({ onSuccess: () => { utils.employees.getById.invalidate(employeeId); toast.success("Employee photo updated"); }, onError: (error) => toast.error(error.message) });
  const createContract = trpc.performanceContracts.create.useMutation({ onSuccess: () => { setContractDialogOpen(false); setContractForm({ contractNumber: "", title: "", startDate: "", endDate: "", objectives: "", terms: "", status: "draft" }); utils.employees.getRelatedData.invalidate({ employeeId }); } });
  const createDiscipline = trpc.employees.disciplinary.create.useMutation({ onSuccess: () => { setDisciplineDialogOpen(false); refetchDiscipline(); toast.success("Disciplinary action recorded"); } });
  const createTransfer = trpc.employees.transfers.create.useMutation({ onSuccess: () => { setTransferDialogOpen(false); refetchMovements(); utils.employees.getById.invalidate(employeeId); toast.success("Department movement recorded"); } });
  const promoteEmployee = trpc.employees.promote.useMutation({ onSuccess: () => { setPromotionDialogOpen(false); utils.employees.getById.invalidate(employeeId); utils.employees.getRelatedData.invalidate({ employeeId }); toast.success("Promotion recorded"); } });

  const jobGroup = (jobGroupsData as any[]).find((jg: any) => jg.id === (employeeData as any)?.jobGroupId);
  const isLoading = employeeLoading || payrollLoading || leaveLoading || attendanceLoading;
  const relatedProjects = relatedData?.projects || [];
  const relatedTasks = relatedData?.tasks || [];
  const relatedTimeEntries = relatedData?.timeEntries || [];
  const relatedDocuments = relatedData?.documents || [];
  const relatedActivity = relatedData?.activity || [];
  const relatedContracts = relatedData?.performanceContracts || [];
  const relatedReviews = relatedData?.performanceReviews || [];
  const relatedAllowances = relatedData?.allowances || [];
  const relatedDeductions = relatedData?.deductions || [];
  const relatedBenefits = relatedData?.benefits || [];

  const employee = employeeData ? {
    id: employeeId,
    employeeId: (employeeData as any).employeeNumber || `EMP-${employeeId.slice(0, 8)}`,
    name: `${(employeeData as any).firstName || ""} ${(employeeData as any).lastName || ""}`.trim() || "Unknown Employee",
    email: (employeeData as any).email || "",
    phone: (employeeData as any).phone || "",
    address: (employeeData as any).address || "",
    department: (employeeData as any).department || "Unknown",
    position: (employeeData as any).position || "Unknown",
    jobGroupId: (employeeData as any).jobGroupId || "",
    jobGroupName: jobGroup?.name || "Unknown",
    employmentType: (employeeData as any).employmentType || "full_time",
    status: (employeeData as any).status || "active",
    country: (employeeData as any).country || "KE",
    dateOfBirth: (employeeData as any).dateOfBirth ? new Date((employeeData as any).dateOfBirth).toISOString().split('T')[0] : "",
    nationalId: (employeeData as any).nationalId || "",
    taxId: (employeeData as any).taxId || "",
    nhifNumber: (employeeData as any).nhifNumber || "",
    nssfNumber: (employeeData as any).nssfNumber || "",
    bankName: (employeeData as any).bankName || "",
    bankBranch: (employeeData as any).bankBranch || "",
    bankAccountNumber: (employeeData as any).bankAccountNumber || "",
    emergencyContactName: (employeeData as any).emergencyContactName || "",
    emergencyContactRelationship: (employeeData as any).emergencyContactRelationship || "",
    emergencyContactPhone: (employeeData as any).emergencyContactPhone || "",
    emergencyContact: (employeeData as any).emergencyContact || "",
    joinDate: (employeeData as any).hireDate ? new Date((employeeData as any).hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    salary: Number((employeeData as any).salary ?? 0),
    photoUrl: (employeeData as any).photoUrl || "",
    avatar: null,
  } : null;

  // Transform backend payroll data
  const payrollHistory = (payrollData as any[])?.map((payslip: any) => ({
    id: payslip.id,
    month: payslip.payPeriod || "N/A",
    basic: payrollCentsToCurrency(payslip.basicSalary),
    allowances: payrollCentsToCurrency(payslip.totalAllowances ?? payslip.allowances),
    gross: payrollCentsToCurrency(payslip.grossPay ?? payslip.grossSalary),
    deductions: payrollCentsToCurrency(payslip.totalDeductions),
    net: payrollCentsToCurrency(payslip.netPay ?? payslip.netSalary),
    payDate: payslip.payDate,
    sentAt: payslip.sentAt,
    viewedAt: payslip.viewedAt,
    htmlContent: payslip.htmlContent,
    allowanceBreakdown: (() => { try { return JSON.parse(payslip.allowancesBreakdown || "[]").map((item: any) => ({ ...item, amount: payrollCentsToCurrency(item.amount), name: item.name || item.allowanceType || item.allowanceName || "Allowance" })); } catch { return []; } })(),
    deductionBreakdown: (() => { try { return JSON.parse(payslip.deductionsBreakdown || "[]").filter((item: any) => item.type !== "benefit").map((item: any) => ({ ...item, amount: payrollCentsToCurrency(item.amount ?? item.cost) })); } catch { return []; } })(),
    benefitBreakdown: (() => { try { return JSON.parse(payslip.benefitsBreakdown || "[]").map((item: any) => ({ ...item, amount: payrollCentsToCurrency(item.amount ?? item.cost) })); } catch { return []; } })(),
    status: payslip.status || "processed",
  })) || [];

  // Transform backend leave data
  const leaveHistory = (leaveData as any[])?.map((leave: any) => ({
    type: leave.leaveType || "Annual Leave",
    startDate: leave.startDate || "",
    endDate: leave.endDate || "",
    days: leave.numberOfDays || 1,
    status: leave.status || "pending",
  })) || [];

  // Transform backend attendance data
  const attendanceRecords = (attendanceData as any[])?.map((record: any) => ({
    date: record.checkInTime ? new Date(record.checkInTime).toISOString().split('T')[0] : "",
    clockIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
    clockOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
    hours: record.hoursWorked || 0,
    status: record.status || "present",
  })) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "on-leave":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-3 w-3" />;
      case "present":
        return <UserCheck className="h-3 w-3" />;
      case "late":
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout title="Employee Details" icon={<User className="h-5 w-5" />} breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "HR", href: "/employees"}, {label: "Employees", href: "/employees"}, {label: "Details"}]} backLink={{label: "Employees", href: "/employees"}}>
        <div className="flex items-center justify-center h-64">
          <p>Loading employee...</p>
        </div>
      </ModuleLayout>
    );
  }

  if (!employee) {
    return (
      <ModuleLayout title="Employee Details" icon={<User className="h-5 w-5" />} breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "HR", href: "/employees"}, {label: "Employees", href: "/employees"}, {label: "Details"}]} backLink={{label: "Employees", href: "/employees"}}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Employee not found</p>
          <Button onClick={() => navigate("/employees")}>Back to Employees</Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout title="Employee Details" icon={<User className="h-5 w-5" />} breadcrumbs={[{label: "Dashboard", href: "/"}, {label: "HR", href: "/employees"}, {label: "Employees", href: "/employees"}, {label: "Details"}]} backLink={{label: "Employees", href: "/employees"}}>
      <div className="space-y-3">
        {/* Action bar */}
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={toggleStar}><Star className={`h-4 w-4 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} /></Button>
            <Button variant="ghost" size="icon" onClick={() => { const email = employee?.email; if (email) window.location.href = `mailto:${email}`; }}><Mail className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(`/employees/${employeeId}/edit`)}><Edit className="h-4 w-4" /></Button>
        </div>

        {/* Split Layout */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left Sidebar */}
          <div className="w-full space-y-3 lg:w-[280px] lg:min-w-[280px]">
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-3">
                    <AvatarImage src={employee?.photoUrl || undefined} alt={employee?.name} />
                    <AvatarFallback className="text-lg">
                      {employee?.name.charAt(0)}{employee?.name.split(' ')[1]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Input type="file" accept="image/*" className="hidden" id="employee-detail-photo" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be less than 5MB"); return; }
                    const reader = new FileReader();
                    reader.onload = () => updateEmployeePhoto.mutate({ id: employeeId, photoUrl: String(reader.result) });
                    reader.readAsDataURL(file);
                    event.currentTarget.value = "";
                  }} />
                  <Button type="button" variant="outline" size="sm" disabled={updateEmployeePhoto.isPending} onClick={() => document.getElementById("employee-detail-photo")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />{updateEmployeePhoto.isPending ? "Uploading..." : "Change photo"}
                  </Button>
                  <h2 className="text-xl font-bold">{employee?.name}</h2>
                  <p className="text-sm text-muted-foreground">{employee?.position}</p>
                  <p className="text-xs text-muted-foreground">{employee?.employeeId}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge variant="default">{employee?.jobGroupName}</Badge>
                  <Badge variant="secondary">{employee?.employmentType?.replace('_', ' ').toUpperCase()}</Badge>
                  <Badge variant={employee?.status === "active" ? "default" : "secondary"}>
                    {employee?.status}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{employee.address || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Country</p>
                      <p className="font-medium">{employee.country || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {new Date(employee.joinDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Compensation & IDs</p>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">Salary</p>
                      <p className="font-bold">{formatAmount(employee.salary || 0)}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">Tax ID</p>
                      <p className="font-bold">{employee.taxId || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">National ID</p>
                      <p className="font-bold">{employee.nationalId || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-muted-foreground">NHIF / NSSF</p>
                      <p className="font-bold">{employee.nhifNumber || "—"} / {employee.nssfNumber || "—"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="flex w-full flex-wrap gap-2 overflow-x-auto pb-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="work">Work</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leave">Leave History</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="compensation">Compensation</TabsTrigger>
                <TabsTrigger value="movements">Movements</TabsTrigger>
                <TabsTrigger value="discipline">Discipline</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Projects</p><FolderKanban className="h-4 w-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-bold">{relatedProjects.length}</p><p className="text-xs text-muted-foreground">Current and past assignments</p></CardContent></Card>
              <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Tasks</p><CheckSquare className="h-4 w-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-bold">{relatedTasks.length}</p><p className="text-xs text-muted-foreground">Assigned work items</p></CardContent></Card>
              <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Documents</p><FileText className="h-4 w-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-bold">{relatedDocuments.length}</p><p className="text-xs text-muted-foreground">Raised or uploaded</p></CardContent></Card>
              <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Time logged</p><Timer className="h-4 w-4 text-muted-foreground" /></div><p className="mt-2 text-2xl font-bold">{Math.round(relatedTimeEntries.reduce((total: number, entry: any) => total + Number(entry.durationMinutes || 0), 0) / 60)}h</p><p className="text-xs text-muted-foreground">Across tracked projects</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Employee Snapshot</CardTitle><CardDescription>Role, reporting context, and key HR relationships.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Job group</p><p className="font-medium">{employee.jobGroupName}</p></div>
                <div><p className="text-xs text-muted-foreground">Employment type</p><p className="font-medium">{employee.employmentType?.replace("_", " ") || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Date of birth</p><p className="font-medium">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Joined</p><p className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Emergency contact</p><p className="font-medium">{employee.emergencyContactName || employee.emergencyContact || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Bank</p><p className="font-medium">{employee.bankName || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">National ID</p><p className="font-medium">{employee.nationalId || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Tax ID</p><p className="font-medium">{employee.taxId || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Latest payroll</p><p className="font-medium">{payrollHistory[0]?.month || "No payroll records"}</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Project Assignments</CardTitle><CardDescription>Projects where this employee is a team member.</CardDescription></div><Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}><DialogTrigger asChild><Button size="sm"><FolderKanban className="mr-2 h-4 w-4" />Assign project</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Assign Project</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Project</Label><Select value={projectForm.projectId} onValueChange={(value) => setProjectForm({ ...projectForm, projectId: value })}><SelectTrigger><SelectValue placeholder="Choose a project" /></SelectTrigger><SelectContent>{(projectsData as any[]).map((project: any) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Role</Label><Input value={projectForm.role} onChange={(event) => setProjectForm({ ...projectForm, role: event.target.value })} placeholder="e.g. Developer" /></div><div><Label>Hours allocated</Label><Input type="number" value={projectForm.hoursAllocated} onChange={(event) => setProjectForm({ ...projectForm, hoursAllocated: event.target.value })} /></div><Button className="w-full" disabled={!projectForm.projectId || addProjectMember.isPending} onClick={() => addProjectMember.mutate({ projectId: projectForm.projectId, employeeId, role: projectForm.role || undefined, hoursAllocated: projectForm.hoursAllocated ? Number(projectForm.hoursAllocated) : undefined })}>Assign employee</Button></div></DialogContent></Dialog></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader><TableBody>
                {relatedProjects.map((project: any) => <TableRow key={project.id}><TableCell><p className="font-medium">{project.name}</p><p className="text-xs text-muted-foreground">{project.projectNumber}</p></TableCell><TableCell>{project.teamRole}</TableCell><TableCell><Badge variant="outline">{project.status}</Badge></TableCell><TableCell>{project.progress || 0}%</TableCell></TableRow>)}
                {!relatedProjects.length && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No project assignments recorded.</TableCell></TableRow>}
              </TableBody></Table></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Assigned Tasks</CardTitle><CardDescription>Project tasks currently associated with this employee.</CardDescription></div><Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}><DialogTrigger asChild><Button size="sm"><CheckSquare className="mr-2 h-4 w-4" />New task</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create Employee Task</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Title</Label><Input value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} /></div><div><Label>Description</Label><Textarea value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} /></div><div><Label>Project</Label><Select value={taskForm.projectId} onValueChange={(value) => setTaskForm({ ...taskForm, projectId: value })}><SelectTrigger><SelectValue placeholder="Optional project" /></SelectTrigger><SelectContent>{(projectsData as any[]).map((project: any) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Priority</Label><Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["low", "medium", "high", "urgent"].map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent></Select></div><Button className="w-full" disabled={!taskForm.title || createTask.isPending} onClick={() => createTask.mutate({ title: taskForm.title, description: taskForm.description || undefined, projectId: taskForm.projectId || undefined, assignedTo: employeeId, priority: taskForm.priority as any })}>Create task</Button></div></DialogContent></Dialog></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead></TableRow></TableHeader><TableBody>
                {relatedTasks.map((task: any) => <TableRow key={task.id}><TableCell><p className="font-medium">{task.title}</p><p className="max-w-md truncate text-xs text-muted-foreground">{task.description || "No description"}</p></TableCell><TableCell><Badge variant={task.priority === "urgent" || task.priority === "high" ? "destructive" : "outline"}>{task.priority}</Badge></TableCell><TableCell>{task.status.replace("_", " ")}</TableCell><TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</TableCell></TableRow>)}
                {!relatedTasks.length && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No assigned tasks recorded.</TableCell></TableRow>}
              </TableBody></Table></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Time Entries</CardTitle><CardDescription>Recent time logged against projects.</CardDescription></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                {relatedTimeEntries.slice(0, 20).map((entry: any) => <TableRow key={entry.id}><TableCell>{entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : "—"}</TableCell><TableCell>{entry.description}</TableCell><TableCell>{Math.round(Number(entry.durationMinutes || 0) / 60 * 10) / 10} hrs</TableCell><TableCell>{entry.status}</TableCell></TableRow>)}
                {!relatedTimeEntries.length && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No time entries recorded.</TableCell></TableRow>}
              </TableBody></Table></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Last 30 days attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record, index) => (
                      <TableRow key={record.date ? `attendance-${record.date}` : `record-${index}`}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.clockIn}</TableCell>
                        <TableCell>{record.clockOut}</TableCell>
                        <TableCell>{record.hours} hrs</TableCell>
                        <TableCell>
                          <Badge variant={record.status === "present" ? "default" : "outline"}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave History</CardTitle>
                <CardDescription>Past leave requests and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveHistory.map((leave, index) => (
                      <TableRow key={leave.startDate ? `leave-${leave.startDate}` : `leave-${index}`}>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.days} days</TableCell>
                        <TableCell>
                          <Badge variant="default">{leave.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payslip History</CardTitle>
                <CardDescription>Full earnings, benefits, deductions, statutory charges, and delivery status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {payrollHistory.map((payslip, index) => (
                  <div key={payslip.id || `${payslip.month}-${index}`} className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="font-semibold">{payslip.month}</p><p className="text-xs text-muted-foreground">Pay date: {payslip.payDate ? new Date(payslip.payDate).toLocaleDateString() : "Not set"}</p></div>
                      <div className="flex items-center gap-2"><Badge variant="outline">{payslip.status}</Badge>{payslip.sentAt && <Badge variant="secondary">Emailed</Badge>}{payslip.viewedAt && <Badge variant="secondary">Viewed</Badge>}</div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-md bg-muted/40 p-3"><p className="mb-2 text-sm font-semibold">Earnings & benefits</p><div className="space-y-1 text-sm"><div className="flex justify-between"><span>Basic salary</span><span>{formatAmount(payslip.basic)}</span></div>{payslip.allowanceBreakdown.map((item: any, itemIndex: number) => <div key={`allowance-${itemIndex}`} className="flex justify-between text-green-700"><span>{item.name || item.allowanceType || "Allowance"}</span><span>+{formatAmount(item.amount)}</span></div>)}{payslip.benefitBreakdown.map((item: any, itemIndex: number) => <div key={`benefit-${itemIndex}`} className="flex justify-between text-emerald-700"><span>{item.name || "Benefit"}</span><span>{formatAmount(item.amount)}</span></div>)}{!payslip.allowanceBreakdown.length && !payslip.benefitBreakdown.length && <p className="text-xs text-muted-foreground">No itemized benefits or allowances recorded.</p>}<div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Gross salary</span><span>{formatAmount(payslip.gross)}</span></div></div></div>
                      <div className="rounded-md bg-muted/40 p-3"><p className="mb-2 text-sm font-semibold">Deductions</p><div className="space-y-1 text-sm">{payslip.deductionBreakdown.map((item: any, itemIndex: number) => <div key={`deduction-${itemIndex}`} className="flex justify-between text-red-700"><span>{item.name || item.deductionType || item.benefitType || "Deduction"}</span><span>-{formatAmount(item.amount)}</span></div>)}{!payslip.deductionBreakdown.length && <p className="text-xs text-muted-foreground">No itemized deductions recorded.</p>}<div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Total deductions</span><span>{formatAmount(payslip.deductions)}</span></div></div></div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-primary/5 p-3"><div><p className="text-xs text-muted-foreground">Final net pay</p><p className="text-xl font-bold">{formatAmount(payslip.net)}</p></div><div className="flex items-center gap-3 text-right text-xs text-muted-foreground"><div><p>Generated: {payslip.sentAt ? new Date(payslip.sentAt).toLocaleString() : "Pending dispatch"}</p>{payslip.htmlContent && <p>Payslip document available</p>}</div>{payslip.htmlContent && <Button size="sm" variant="outline" onClick={() => navigate(`/payslips/${payslip.id}`)}>View payslip</Button>}</div></div>
                  </div>
                ))}
                {!payrollHistory.length && <div className="flex h-24 items-center justify-center text-muted-foreground">No payslips have been generated for this employee.</div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="space-y-4">
            <Card><CardHeader><CardTitle>Benefits & Allowances</CardTitle><CardDescription>Recurring compensation inputs used during automated payroll.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Frequency</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
              {relatedAllowances.map((item: any) => <TableRow key={`a-${item.id}`}><TableCell>Allowance</TableCell><TableCell>{item.allowanceType}</TableCell><TableCell>{formatAmount(Number(item.amount || 0) / 100)}</TableCell><TableCell>{item.frequency}</TableCell><TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell></TableRow>)}
              {relatedBenefits.map((item: any) => <TableRow key={`b-${item.id}`}><TableCell>Benefit</TableCell><TableCell>{item.benefitType}{item.provider ? ` · ${item.provider}` : ""}</TableCell><TableCell>{formatAmount(Number(item.cost || 0) / 100)}</TableCell><TableCell>Monthly</TableCell><TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell></TableRow>)}
              {!relatedAllowances.length && !relatedBenefits.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No benefits or allowances configured.</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
            <Card><CardHeader><CardTitle>Employee Deductions</CardTitle><CardDescription>Custom deductions included automatically in the next payroll run.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Frequency</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
              {relatedDeductions.map((item: any) => <TableRow key={item.id}><TableCell>{item.deductionType}</TableCell><TableCell>{item.reference || "—"}</TableCell><TableCell>{formatAmount(Number(item.amount || 0) / 100)}</TableCell><TableCell>{item.frequency}</TableCell><TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell></TableRow>)}
              {!relatedDeductions.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No custom deductions configured.</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Department Movements</CardTitle><CardDescription>Scheduled and completed interdepartmental transfers.</CardDescription></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPromotionDialogOpen(true)}><Award className="mr-2 h-4 w-4" />Promote</Button>
                  <Button size="sm" onClick={() => setTransferDialogOpen(true)}><ArrowRightLeft className="mr-2 h-4 w-4" />Transfer</Button>
                </div>
              </CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Effective</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader><TableBody>
                {departmentMovements.map((movement: any) => <TableRow key={movement.id}><TableCell>{movement.fromDepartment || "Unassigned"}</TableCell><TableCell>{movement.toDepartment}</TableCell><TableCell>{movement.effectiveDate ? new Date(movement.effectiveDate).toLocaleDateString() : "—"}</TableCell><TableCell><Badge variant="outline">{movement.status}</Badge></TableCell><TableCell>{movement.reason || "—"}</TableCell></TableRow>)}
                {!departmentMovements.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No department movements recorded.</TableCell></TableRow>}
              </TableBody></Table></CardContent>
            </Card>
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}><DialogContent><DialogHeader><DialogTitle>Transfer Employee</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>New department</Label><Select value={transferForm.toDepartment} onValueChange={(value) => setTransferForm({ ...transferForm, toDepartment: value })}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{(departmentsData as any[]).map((department: any) => <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Effective date</Label><Input type="date" value={transferForm.effectiveDate} onChange={(event) => setTransferForm({ ...transferForm, effectiveDate: event.target.value })} /></div><div><Label>Reason</Label><Textarea value={transferForm.reason} onChange={(event) => setTransferForm({ ...transferForm, reason: event.target.value })} /></div><Button className="w-full" disabled={!transferForm.toDepartment || createTransfer.isPending} onClick={() => createTransfer.mutate({ employeeId, toDepartment: transferForm.toDepartment, effectiveDate: transferForm.effectiveDate || new Date().toISOString().slice(0, 10), reason: transferForm.reason || undefined })}>Record transfer</Button></div></DialogContent></Dialog>
            <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}><DialogContent><DialogHeader><DialogTitle>Promote Employee</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>New job group</Label><Select value={promotionForm.newJobGroupId} onValueChange={(value) => setPromotionForm({ ...promotionForm, newJobGroupId: value })}><SelectTrigger><SelectValue placeholder="Select job group" /></SelectTrigger><SelectContent>{(jobGroupsData as any[]).map((group: any) => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}</SelectContent></Select></div><div><Label>New salary</Label><Input type="number" value={promotionForm.newSalary} onChange={(event) => setPromotionForm({ ...promotionForm, newSalary: event.target.value })} placeholder="Optional" /></div><div><Label>Effective date</Label><Input type="date" value={promotionForm.effectiveDate} onChange={(event) => setPromotionForm({ ...promotionForm, effectiveDate: event.target.value })} /></div><div><Label>Notes</Label><Textarea value={promotionForm.notes} onChange={(event) => setPromotionForm({ ...promotionForm, notes: event.target.value })} /></div><Button className="w-full" disabled={!promotionForm.newJobGroupId || promoteEmployee.isPending} onClick={() => promoteEmployee.mutate({ employeeId, newJobGroupId: promotionForm.newJobGroupId, newSalary: promotionForm.newSalary ? Number(promotionForm.newSalary) : undefined, effectiveDate: promotionForm.effectiveDate || new Date().toISOString().slice(0, 10), notes: promotionForm.notes || undefined })}>Record promotion</Button></div></DialogContent></Dialog>
          </TabsContent>

          <TabsContent value="discipline" className="space-y-4">
            <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Disciplinary Actions</CardTitle><CardDescription>Confidential employee conduct and resolution history.</CardDescription></div><Button size="sm" onClick={() => setDisciplineDialogOpen(true)}><ShieldAlert className="mr-2 h-4 w-4" />Record action</Button></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Severity</TableHead><TableHead>Incident</TableHead><TableHead>Status</TableHead><TableHead>Description</TableHead></TableRow></TableHeader><TableBody>
              {(disciplinaryRecords as any[]).map((record: any) => <TableRow key={record.id}><TableCell>{record.actionType}</TableCell><TableCell><Badge variant={record.severity === "critical" ? "destructive" : "outline"}>{record.severity}</Badge></TableCell><TableCell>{record.incidentDate ? new Date(record.incidentDate).toLocaleDateString() : "—"}</TableCell><TableCell>{record.status}</TableCell><TableCell className="max-w-sm truncate">{record.description}</TableCell></TableRow>)}
              {!disciplinaryRecords.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No disciplinary actions recorded.</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
            <Dialog open={disciplineDialogOpen} onOpenChange={setDisciplineDialogOpen}><DialogContent><DialogHeader><DialogTitle>Record Disciplinary Action</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Action type</Label><Input value={disciplineForm.actionType} onChange={(event) => setDisciplineForm({ ...disciplineForm, actionType: event.target.value })} /></div><div><Label>Severity</Label><Select value={disciplineForm.severity} onValueChange={(value) => setDisciplineForm({ ...disciplineForm, severity: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["low", "medium", "high", "critical"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><div><Label>Incident date</Label><Input type="date" value={disciplineForm.incidentDate} onChange={(event) => setDisciplineForm({ ...disciplineForm, incidentDate: event.target.value })} /></div><div><Label>Description</Label><Textarea value={disciplineForm.description} onChange={(event) => setDisciplineForm({ ...disciplineForm, description: event.target.value })} /></div><div><Label>Action taken</Label><Textarea value={disciplineForm.actionTaken} onChange={(event) => setDisciplineForm({ ...disciplineForm, actionTaken: event.target.value })} /></div><Button className="w-full" disabled={!disciplineForm.description || createDiscipline.isPending} onClick={() => createDiscipline.mutate({ employeeId, ...disciplineForm, severity: disciplineForm.severity as any, incidentDate: disciplineForm.incidentDate || new Date().toISOString().slice(0, 10) })}>Save action</Button></div></DialogContent></Dialog>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Performance Contracts</CardTitle><CardDescription>Contract objectives and employment performance commitments linked to this employee.</CardDescription></div><Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}><DialogTrigger asChild><Button size="sm"><Award className="mr-2 h-4 w-4" />New contract</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create Performance Contract</DialogTitle></DialogHeader><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><Label>Contract number</Label><Input value={contractForm.contractNumber} onChange={(event) => setContractForm({ ...contractForm, contractNumber: event.target.value })} /></div><div><Label>Title</Label><Input value={contractForm.title} onChange={(event) => setContractForm({ ...contractForm, title: event.target.value })} /></div></div><div className="grid grid-cols-2 gap-3"><div><Label>Start date</Label><Input type="date" value={contractForm.startDate} onChange={(event) => setContractForm({ ...contractForm, startDate: event.target.value })} /></div><div><Label>End date</Label><Input type="date" value={contractForm.endDate} onChange={(event) => setContractForm({ ...contractForm, endDate: event.target.value })} /></div></div><div><Label>Objectives</Label><Textarea value={contractForm.objectives} onChange={(event) => setContractForm({ ...contractForm, objectives: event.target.value })} /></div><div><Label>Terms</Label><Textarea value={contractForm.terms} onChange={(event) => setContractForm({ ...contractForm, terms: event.target.value })} /></div><Button className="w-full" disabled={!contractForm.contractNumber || !contractForm.title || !contractForm.startDate || createContract.isPending} onClick={() => createContract.mutate({ employeeId, jobGroupId: employee.jobGroupId || undefined, contractNumber: contractForm.contractNumber, title: contractForm.title, startDate: contractForm.startDate, endDate: contractForm.endDate || undefined, objectives: contractForm.objectives || undefined, terms: contractForm.terms || undefined, status: contractForm.status as any })}>Create contract</Button></div></DialogContent></Dialog></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Contract</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead>Objectives</TableHead></TableRow></TableHeader><TableBody>
              {relatedContracts.map((contract: any) => <TableRow key={contract.id}><TableCell><p className="font-medium">{contract.title}</p><p className="text-xs text-muted-foreground">{contract.contractNumber}</p></TableCell><TableCell>{new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "Open"}</TableCell><TableCell><Badge variant={contract.status === "active" ? "default" : "outline"}>{contract.status}</Badge></TableCell><TableCell className="max-w-sm truncate">{contract.objectives || "—"}</TableCell></TableRow>)}
              {!relatedContracts.length && <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">No performance contracts recorded.</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
            <Card><CardHeader><CardTitle>Performance Reviews</CardTitle><CardDescription>Review history and development feedback.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Rating</TableHead><TableHead>KPI score</TableHead><TableHead>Status</TableHead><TableHead>Comments</TableHead></TableRow></TableHeader><TableBody>
              {relatedReviews.map((review: any) => <TableRow key={review.id}><TableCell>{review.period}</TableCell><TableCell>{review.overallRating || "—"}/5</TableCell><TableCell>{review.kpiScore ?? "—"}</TableCell><TableCell>{review.status}</TableCell><TableCell className="max-w-sm truncate">{review.comments || "—"}</TableCell></TableRow>)}
              {!relatedReviews.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">No performance reviews recorded.</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Documents Raised</CardTitle><CardDescription>Documents linked to this employee or uploaded from their account.</CardDescription></div><Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}><DialogTrigger asChild><Button size="sm"><FileText className="mr-2 h-4 w-4" />Upload document</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Upload Employee Document</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Document name</Label><Input value={documentForm.name} onChange={(event) => setDocumentForm({ ...documentForm, name: event.target.value })} /></div><div><Label>File</Label><Input type="file" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setDocumentForm({ ...documentForm, name: documentForm.name || file.name, mimeType: file.type || "application/octet-stream", size: file.size, fileData: String(reader.result || "") }); reader.readAsDataURL(file); }} /></div><Button className="w-full" disabled={!documentForm.name || !documentForm.fileData || uploadDocument.isPending} onClick={() => uploadDocument.mutate({ name: documentForm.name, mimeType: documentForm.mimeType, size: documentForm.size, fileData: documentForm.fileData, documentType: documentForm.documentType as any, linkedEntityType: "employee", linkedEntityId: employeeId })}>Upload document</Button></div></DialogContent></Dialog></CardHeader>
              <CardContent><Table><TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead /></TableRow></TableHeader><TableBody>
                {relatedDocuments.map((document: any) => <TableRow key={document.id}><TableCell><p className="font-medium">{document.documentName}</p><p className="text-xs text-muted-foreground">{document.mimeType || "File"}</p></TableCell><TableCell>{document.documentType || "other"}</TableCell><TableCell><Badge variant="outline">{document.status || "active"}</Badge></TableCell><TableCell>{document.createdAt ? new Date(document.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell>{document.fileUrl ? <Button variant="ghost" size="sm" asChild><a href={document.fileUrl} target="_blank" rel="noreferrer">Open</a></Button> : null}</TableCell></TableRow>)}
                {!relatedDocuments.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No employee documents recorded.</TableCell></TableRow>}
              </TableBody></Table></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Employee Activity</CardTitle><CardDescription>Audit events raised against this employee record.</CardDescription></CardHeader>
              <CardContent>
                {relatedActivity.length ? <div className="space-y-4">{relatedActivity.map((item: any) => <div key={item.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0"><Activity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="font-medium">{item.description || item.action}</p><p className="text-xs text-muted-foreground">{item.action} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p></div></div>)}</div> : <div className="flex h-24 items-center justify-center text-muted-foreground">No activity recorded for this employee.</div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
