import{r as d,j as e}from"./vendor-react-ui-ChrK0KND.js";import{z,u as B,t as c,j as l,a7 as H,C as O,e as V,f as R,h as G,b as Q,H as D,J as C,K as F,L as I,M as m,I as u,B as h}from"./index-C4MPA5Gw.js";import{M as E}from"./ModuleLayout-DF4QThWU.js";import{L as n}from"./label-DHvuAVBW.js";import{T as Y}from"./textarea-jA1kr0xi.js";import{u as _}from"./useCompanyInfo-B35_MUnV.js";import{s as y,D as $,T as q,A as J,l as W,V as X}from"./lucide-react-BVl0iQLf.js";import"./rich-editor-DQKc7IGv.js";import"./api-client-AVPKoqv3.js";import"./date-utils-DjU31VWN.js";function de(){const{id:i}=z(),[,x]=B(),g=c.useUtils(),b=_(),[S,f]=d.useState(!1),[a,o]=d.useState({employeeId:"",month:new Date().toISOString().split("T")[0].slice(0,7),basicSalary:"",allowances:"",deductions:"",status:"pending",notes:""}),[L,T]=d.useState(!0),{data:t}=c.payroll.getById.useQuery(i||"",{enabled:!!i}),{data:p=[]}=c.employees.list.useQuery({});d.useEffect(()=>{t&&(o({employeeId:t.employeeId||"",month:t.month?new Date(t.month).toISOString().split("T")[0].slice(0,7):new Date().toISOString().split("T")[0].slice(0,7),basicSalary:t.basicSalary?(t.basicSalary/100).toString():"",allowances:t.allowances?(t.allowances/100).toString():"",deductions:t.deductions?(t.deductions/100).toString():"",status:t.status||"pending",notes:t.notes||""}),T(!1))},[t]);const v=c.payroll.update.useMutation({onSuccess:()=>{l.success("Payroll record updated successfully!"),g.payroll.list.invalidate(),g.payroll.getById.invalidate(i||""),x("/payroll")},onError:s=>{l.error(`Failed to update payroll record: ${s.message}`)}}),w=c.payroll.delete.useMutation({onSuccess:()=>{l.success("Payroll record deleted successfully!"),g.payroll.list.invalidate(),x("/payroll")},onError:s=>{l.error(`Failed to delete payroll record: ${s.message}`)}}),k=s=>{if(s.preventDefault(),!a.employeeId||!a.month||!a.basicSalary){l.error("Please fill in all required fields");return}v.mutate({id:i||"",employeeId:a.employeeId,month:new Date(`${a.month}-01`),basicSalary:Math.round(parseFloat(a.basicSalary)*100),allowances:a.allowances?Math.round(parseFloat(a.allowances)*100):void 0,deductions:a.deductions?Math.round(parseFloat(a.deductions)*100):void 0,status:a.status,notes:a.notes||void 0})},A=()=>{confirm("Are you sure you want to delete this payroll record? This action cannot be undone.")&&w.mutate(i||"")},P=()=>{const s=p.find(r=>r.id===a.employeeId);return s?`${s.firstName} ${s.lastName}`:"Unknown"},M=d.useCallback(async()=>{f(!0);try{const s=window.open("","_blank");if(!s){l.error("Please allow popups to download PDF"),f(!1);return}const r=parseFloat(a.basicSalary||"0"),j=parseFloat(a.allowances||"0"),N=parseFloat(a.deductions||"0"),K=r+j-N,U=`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip - ${P()} - ${a.month}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: right; font-size: 12px; }
            .document-title { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            .employee-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .earnings-section, .deductions-section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; padding: 8px; background: #e5e7eb; border-radius: 4px; }
            .amount-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .net-salary { font-size: 20px; font-weight: bold; color: #059669; text-align: right; padding: 15px; background: #d1fae5; border-radius: 8px; margin-top: 20px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-processed { background: #dbeafe; color: #1e40af; }
            .status-paid { background: #d1fae5; color: #065f46; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="document-title">PAYSLIP</div>
              <div>Period: ${a.month}</div>
            </div>
            <div class="company-info">
              <strong>${H}</strong><br>
              ${b.address?b.address+"<br>":""}
              ${b.email||""}
            </div>
          </div>
          
          <div class="employee-info">
            <div class="info-row">
              <span class="label">Employee Name:</span>
              <span>${P()}</span>
            </div>
            <div class="info-row">
              <span class="label">Pay Period:</span>
              <span>${a.month}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="status status-${a.status||"pending"}">${(a.status||"pending").toUpperCase()}</span>
            </div>
          </div>
          
          <div class="earnings-section">
            <div class="section-title">Earnings</div>
            <div class="amount-row">
              <span>Basic Salary</span>
              <span>KES ${r.toLocaleString()}</span>
            </div>
            <div class="amount-row">
              <span>Allowances</span>
              <span>KES ${j.toLocaleString()}</span>
            </div>
            <div class="amount-row" style="font-weight: bold;">
              <span>Total Earnings</span>
              <span>KES ${(r+j).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="deductions-section">
            <div class="section-title">Deductions</div>
            <div class="amount-row">
              <span>Total Deductions</span>
              <span>KES ${N.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="net-salary">
            Net Salary: KES ${K.toLocaleString()}
          </div>
          
          ${a.notes?`
            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <strong>Notes:</strong><br>
              ${a.notes}
            </div>
          `:""}
          
          <script>
            window.onload = function() {
              window.print();
            }
          <\/script>
        </body>
        </html>
      `;s.document.write(U),s.document.close(),l.success("PDF download initiated")}catch(s){console.error("PDF generation error:",s),l.error("Failed to generate PDF")}finally{f(!1)}},[a,p]);return L?e.jsx(E,{title:"Edit Payroll",description:"Update payroll record",icon:e.jsx($,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"HR",href:"/hr"},{label:"Payroll",href:"/payroll"},{label:"Edit Payroll"}],children:e.jsx("div",{className:"flex items-center justify-center p-8",children:e.jsx(y,{className:"h-8 w-8 animate-spin"})})}):e.jsx(E,{title:"Edit Payroll",description:"Update payroll record",icon:e.jsx($,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"HR",href:"/hr"},{label:"Payroll",href:"/payroll"},{label:"Edit Payroll"}],children:e.jsx("div",{className:"max-w-2xl",children:e.jsxs(O,{children:[e.jsxs(V,{children:[e.jsx(R,{children:"Edit Payroll"}),e.jsx(G,{children:"Update the payroll record below"})]}),e.jsx(Q,{children:e.jsxs("form",{onSubmit:k,className:"space-y-6",children:[e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"employeeId",children:"Employee *"}),e.jsxs(D,{value:a.employeeId,onValueChange:s=>o({...a,employeeId:s}),children:[e.jsx(C,{children:e.jsx(F,{placeholder:"Select an employee"})}),e.jsx(I,{children:Array.isArray(p)&&p.map(s=>e.jsxs(m,{value:s.id,children:[s.firstName||""," ",s.lastName||""]},s.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"month",children:"Month *"}),e.jsx(u,{id:"month",type:"month",value:a.month,onChange:s=>o({...a,month:s.target.value})})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"basicSalary",children:"Basic Salary (Ksh) *"}),e.jsx(u,{id:"basicSalary",type:"number",placeholder:"0.00",value:a.basicSalary,onChange:s=>o({...a,basicSalary:s.target.value}),step:"0.01",min:"0"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"allowances",children:"Allowances (Ksh)"}),e.jsx(u,{id:"allowances",type:"number",placeholder:"0.00",value:a.allowances,onChange:s=>o({...a,allowances:s.target.value}),step:"0.01",min:"0"})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"deductions",children:"Deductions (Ksh)"}),e.jsx(u,{id:"deductions",type:"number",placeholder:"0.00",value:a.deductions,onChange:s=>o({...a,deductions:s.target.value}),step:"0.01",min:"0"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"status",children:"Status"}),e.jsxs(D,{value:a.status,onValueChange:s=>o({...a,status:s}),children:[e.jsx(C,{children:e.jsx(F,{placeholder:"Select status"})}),e.jsxs(I,{children:[e.jsx(m,{value:"pending",children:"Pending"}),e.jsx(m,{value:"processed",children:"Processed"}),e.jsx(m,{value:"paid",children:"Paid"})]})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{htmlFor:"notes",children:"Notes"}),e.jsx(Y,{id:"notes",placeholder:"Add any additional notes",value:a.notes,onChange:s=>o({...a,notes:s.target.value}),rows:4})]}),e.jsxs("div",{className:"flex gap-2 justify-between",children:[e.jsxs(h,{type:"button",variant:"destructive",onClick:A,disabled:w.isPending,children:[w.isPending?e.jsx(y,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(q,{className:"mr-2 h-4 w-4"}),"Delete"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(h,{type:"button",variant:"outline",onClick:()=>x("/payroll"),children:[e.jsx(J,{className:"mr-2 h-4 w-4"}),"Cancel"]}),e.jsxs(h,{type:"button",variant:"outline",onClick:M,disabled:S,children:[S?e.jsx(y,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(W,{className:"mr-2 h-4 w-4"}),"Download Payslip"]}),e.jsxs(h,{type:"submit",disabled:v.isPending,children:[v.isPending?e.jsx(y,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(X,{className:"mr-2 h-4 w-4"}),"Update Payroll"]})]})]})]})})]})})})}export{de as default};
