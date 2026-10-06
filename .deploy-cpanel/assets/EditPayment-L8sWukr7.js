import{r as d,j as e}from"./vendor-react-ui-D_dP7EUb.js";import{f as z,y as B,u as Q,t as l,g as r,a9 as q,C as _,c as G,d as K,e as Y,a as H,o as h,p as y,q as f,r as x,s as m,I as D,B as v}from"./index-Bmob1iPg.js";import{M as A}from"./ModuleLayout-kIURw6ee.js";import{L as o}from"./label-DONXMvoU.js";import{T as W}from"./textarea-D5NWr3a1.js";import{g as X}from"./paymentMethods-r32LliAe.js";import{S as J}from"./spinner-Deg75DDu.js";import{u as Z}from"./useCompanyInfo-BXeAa40i.js";import{L as b,D as F,b as ee,ap as ae,ao as te}from"./lucide-react-CV8Hp_LM.js";import"./rich-editor-DQKc7IGv.js";import"./api-client-DdKH_gqd.js";import"./date-utils-COA5zMcC.js";import"./PageHeader-DsL1klo1.js";function xe(){const{allowed:M,isLoading:O}=z("accounting:payments:edit"),c=Z(),i=B().id,[,g]=Q(),j=l.useUtils(),[C,N]=d.useState(!1),[t,n]=d.useState({invoiceId:"",clientId:"",amount:"",paymentDate:new Date().toISOString().split("T")[0],paymentMethod:"cash",referenceNumber:"",notes:"",status:"pending",chartOfAccountId:""}),[E,$]=d.useState(!0),{data:s}=l.payments.getById.useQuery(i||"",{enabled:!!i}),{data:p=[]}=l.invoices.list.useQuery({}),{data:u=[]}=l.clients.list.useQuery({}),{data:S=[]}=l.chartOfAccounts.list.useQuery({});d.useEffect(()=>{s&&(n({invoiceId:s.invoiceId||"",clientId:s.clientId||"",amount:(s.amount/100).toString(),paymentDate:s.paymentDate?new Date(s.paymentDate).toISOString().split("T")[0]:new Date().toISOString().split("T")[0],paymentMethod:s.paymentMethod||"cash",referenceNumber:s.referenceNumber||"",notes:s.notes||"",status:s.status||"pending",chartOfAccountId:s.chartOfAccountId?s.chartOfAccountId.toString():""}),$(!1))},[s]);const w=l.payments.update.useMutation({onSuccess:()=>{r.success("Payment updated successfully!"),j.payments.list.invalidate(),j.payments.getById.invalidate(i||""),g("/payments")},onError:a=>{r.error(`Failed to update payment: ${a.message}`)}}),I=l.payments.delete.useMutation({onSuccess:()=>{r.success("Payment deleted successfully!"),j.payments.list.invalidate(),g("/payments")},onError:a=>{r.error(`Failed to delete payment: ${a.message}`)}}),T=a=>{if(a.preventDefault(),!t.amount){r.error("Please fill in all required fields");return}w.mutate({id:i||"",amount:Math.round(parseFloat(t.amount)*100),paymentDate:new Date(t.paymentDate).toISOString().split("T")[0],paymentMethod:t.paymentMethod,referenceNumber:t.referenceNumber||void 0,notes:t.notes||void 0,status:t.status,chartOfAccountId:t.chartOfAccountId?parseInt(t.chartOfAccountId):void 0})},L=()=>{confirm("Are you sure you want to delete this payment? This action cannot be undone.")&&I.mutate(i||"")},k=d.useCallback(async()=>{N(!0);try{const a=window.open("","_blank");if(!a){r.error("Please allow popups to download PDF"),N(!1);return}const R=u.find(P=>P.id===t.clientId),U=p.find(P=>P.id===t.invoiceId),V=`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Receipt - ${t.referenceNumber||i}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info { text-align: right; font-size: 12px; }
            .document-title { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .info-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { }
            .amount { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: #eff6ff; border-radius: 8px; margin: 20px 0; }
            .notes { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="document-title">PAYMENT RECEIPT</div>
              <div><strong>${t.referenceNumber||i}</strong></div>
            </div>
            <div class="company-info">
              <strong>${q}</strong><br>
              ${c.address?c.address+"<br>":""}
              ${c.email?c.email+"<br>":""}
              ${c.phone||""}
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="label">Client:</span>
              <span class="value">${R?.companyName||"N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Invoice:</span>
              <span class="value">${U?.invoiceNumber||"N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Date:</span>
              <span class="value">${t.paymentDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span class="value">${t.paymentMethod.replace("_"," ").toUpperCase()}</span>
            </div>
            ${t.referenceNumber?`
            <div class="info-row">
              <span class="label">Reference Number:</span>
              <span class="value">${t.referenceNumber}</span>
            </div>
            `:""}
          </div>
          
          <div class="amount">
            Amount Paid: KES ${parseFloat(t.amount||"0").toLocaleString()}
          </div>
          
          ${t.notes?`
            <div class="notes">
              <strong>Notes:</strong><br>
              ${t.notes}
            </div>
          `:""}
          
          <script>
            window.onload = function() {
              window.print();
            }
          <\/script>
        </body>
        </html>
      `;a.document.write(V),a.document.close(),r.success("PDF download initiated")}catch(a){console.error("PDF generation error:",a),r.error("Failed to generate PDF")}finally{N(!1)}},[t,u,p,i]);return O?e.jsx("div",{className:"flex items-center justify-center h-screen",children:e.jsx(J,{className:"size-8"})}):M?E?e.jsx(A,{title:"Edit Payment",description:"Update payment details",icon:e.jsx(F,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"Accounting",href:"/accounting"},{label:"Payments",href:"/payments"},{label:"Edit Payment"}],children:e.jsx("div",{className:"flex items-center justify-center p-8",children:e.jsx(b,{className:"h-8 w-8 animate-spin"})})}):e.jsx(A,{title:"Edit Payment",description:"Update payment details",icon:e.jsx(F,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"Accounting",href:"/accounting"},{label:"Payments",href:"/payments"},{label:"Edit Payment"}],children:e.jsx("div",{className:"max-w-2xl",children:e.jsxs(_,{children:[e.jsxs(G,{children:[e.jsx(K,{children:"Edit Payment"}),e.jsx(Y,{children:"Update the payment details below"})]}),e.jsx(H,{children:e.jsxs("form",{onSubmit:T,className:"space-y-6",children:[e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"clientId",children:"Client *"}),e.jsxs(h,{value:t.clientId,onValueChange:a=>n({...t,clientId:a}),disabled:!0,children:[e.jsx(y,{children:e.jsx(f,{placeholder:"Select a client"})}),e.jsx(x,{children:Array.isArray(u)&&u.map(a=>e.jsx(m,{value:a.id,children:a.companyName||a.contactPerson},a.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"invoiceId",children:"Invoice *"}),e.jsxs(h,{value:t.invoiceId,onValueChange:a=>n({...t,invoiceId:a}),disabled:!0,children:[e.jsx(y,{children:e.jsx(f,{placeholder:"Select an invoice"})}),e.jsx(x,{children:Array.isArray(p)&&p.map(a=>e.jsx(m,{value:a.id,children:a.invoiceNumber},a.id))})]})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"amount",children:"Amount (Ksh) *"}),e.jsx(D,{id:"amount",type:"number",placeholder:"0.00",value:t.amount,onChange:a=>n({...t,amount:a.target.value}),step:"0.01",min:"0"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"paymentDate",children:"Payment Date *"}),e.jsx(D,{id:"paymentDate",type:"date",value:t.paymentDate,onChange:a=>n({...t,paymentDate:a.target.value})})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"paymentMethod",children:"Payment Method *"}),e.jsxs(h,{value:t.paymentMethod,onValueChange:a=>n({...t,paymentMethod:a}),children:[e.jsx(y,{children:e.jsx(f,{placeholder:"Select payment method"})}),e.jsx(x,{children:X().map(a=>e.jsx(m,{value:a.value,children:a.label},a.value))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"chartOfAccountId",children:"Chart of Account"}),e.jsxs(h,{value:t.chartOfAccountId,onValueChange:a=>n({...t,chartOfAccountId:a}),children:[e.jsx(y,{children:e.jsx(f,{placeholder:"Select account (optional)"})}),e.jsxs(x,{children:[e.jsx(m,{value:"",children:"None"}),Array.isArray(S)&&S.map(a=>e.jsxs(m,{value:a.id.toString(),children:[a.accountCode," - ",a.accountName]},a.id))]})]})]})]}),e.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"referenceNumber",children:"Reference Number"}),e.jsx(D,{id:"referenceNumber",placeholder:"e.g., TXN123456",value:t.referenceNumber,onChange:a=>n({...t,referenceNumber:a.target.value})})]})}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"notes",children:"Notes"}),e.jsx(W,{id:"notes",placeholder:"Add any additional notes about this payment",value:t.notes,onChange:a=>n({...t,notes:a.target.value}),rows:4})]}),e.jsxs("div",{className:"flex gap-2 justify-between",children:[e.jsx("div",{className:"flex gap-2",children:e.jsxs(v,{type:"button",variant:"destructive",onClick:L,disabled:I.isPending,children:[I.isPending?e.jsx(b,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(ee,{className:"mr-2 h-4 w-4"}),"Delete"]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(v,{type:"button",variant:"outline",onClick:()=>g("/payments"),children:[e.jsx(ae,{className:"mr-2 h-4 w-4"}),"Cancel"]}),e.jsxs(v,{type:"button",variant:"outline",onClick:k,disabled:C,children:[C?e.jsx(b,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(te,{className:"mr-2 h-4 w-4"}),"Download PDF"]}),e.jsxs(v,{type:"submit",disabled:w.isPending,children:[w.isPending&&e.jsx(b,{className:"mr-2 h-4 w-4 animate-spin"}),"Update Payment"]})]})]})]})})]})})}):null}export{xe as default};
