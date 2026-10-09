import{r as d,j as e}from"./vendor-react-ui-CDYEcUL0.js";import{i as B,E as Q,u as V,t as l,j as r,a9 as K,k as _,C as q,e as G,f as Y,h as H,b as J,J as j,K as N,L as w,M as P,N as D,I,B as u}from"./index-CB2TZP-F.js";import{M as S}from"./ModuleLayout-ptkqjAIQ.js";import{L as o}from"./label-BuYj1RsS.js";import{T as W}from"./textarea-BzqimCLY.js";import{C as X}from"./ChartOfAccountsSelector-BfWKpeWW.js";import{g as Z}from"./paymentMethods-r32LliAe.js";import{u as ee}from"./useCompanyInfo-C2D9A-Xw.js";import{r as h,D as A,T as ae,A as te,l as se}from"./lucide-react-C64s4RRG.js";import"./rich-editor-DQKc7IGv.js";import"./api-client-BsgT-Ymu.js";import"./date-utils-CH9B62Ph.js";import"./SearchableSelect-BHjgogTz.js";import"./command-Dl6J63Xy.js";import"./popover-DDABvub_.js";function ge(){const{allowed:F,isLoading:M}=B("accounting:payments:edit"),c=ee(),i=Q().id,[,y]=V(),f=l.useUtils(),[C,x]=d.useState(!1),[t,n]=d.useState({invoiceId:"",clientId:"",amount:"",paymentDate:new Date().toISOString().split("T")[0],paymentMethod:"cash",referenceNumber:"",notes:"",status:"pending",chartOfAccountId:""}),[E,O]=d.useState(!0),{data:s}=l.payments.getById.useQuery(i||"",{enabled:!!i}),{data:m=[]}=l.invoices.list.useQuery({}),{data:p=[]}=l.clients.list.useQuery({}),{data:T=[]}=l.chartOfAccounts.list.useQuery({});d.useEffect(()=>{s&&(n({invoiceId:s.invoiceId||"",clientId:s.clientId||"",amount:(s.amount/100).toString(),paymentDate:s.paymentDate?new Date(s.paymentDate).toISOString().split("T")[0]:new Date().toISOString().split("T")[0],paymentMethod:s.paymentMethod||"cash",referenceNumber:s.referenceNumber||"",notes:s.notes||"",status:s.status||"pending",chartOfAccountId:s.chartOfAccountId?s.chartOfAccountId.toString():""}),O(!1))},[s]);const b=l.payments.update.useMutation({onSuccess:()=>{r.success("Payment updated successfully!"),f.payments.list.invalidate(),f.payments.getById.invalidate(i||""),y("/payments")},onError:a=>{r.error(`Failed to update payment: ${a.message}`)}}),v=l.payments.delete.useMutation({onSuccess:()=>{r.success("Payment deleted successfully!"),f.payments.list.invalidate(),y("/payments")},onError:a=>{r.error(`Failed to delete payment: ${a.message}`)}}),$=a=>{if(a.preventDefault(),!t.amount){r.error("Please fill in all required fields");return}b.mutate({id:i||"",amount:Math.round(parseFloat(t.amount)*100),paymentDate:new Date(t.paymentDate).toISOString().split("T")[0],paymentMethod:t.paymentMethod,referenceNumber:t.referenceNumber||void 0,notes:t.notes||void 0,status:t.status,chartOfAccountId:t.chartOfAccountId||null})},L=()=>{confirm("Are you sure you want to delete this payment? This action cannot be undone.")&&v.mutate(i||"")},k=d.useCallback(async()=>{x(!0);try{const a=window.open("","_blank");if(!a){r.error("Please allow popups to download PDF"),x(!1);return}const R=p.find(g=>g.id===t.clientId),U=m.find(g=>g.id===t.invoiceId),z=`
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
              <strong>${K}</strong><br>
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
      `;a.document.write(z),a.document.close(),r.success("PDF download initiated")}catch(a){console.error("PDF generation error:",a),r.error("Failed to generate PDF")}finally{x(!1)}},[t,p,m,i]);return M?e.jsx("div",{className:"flex items-center justify-center h-screen",children:e.jsx(_,{className:"size-8"})}):F?E?e.jsx(S,{title:"Edit Payment",description:"Update payment details",icon:e.jsx(A,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"Accounting",href:"/accounting"},{label:"Payments",href:"/payments"},{label:"Edit Payment"}],children:e.jsx("div",{className:"flex items-center justify-center p-8",children:e.jsx(h,{className:"h-8 w-8 animate-spin"})})}):e.jsx(S,{title:"Edit Payment",description:"Update payment details",icon:e.jsx(A,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"Accounting",href:"/accounting"},{label:"Payments",href:"/payments"},{label:"Edit Payment"}],children:e.jsx("div",{className:"max-w-2xl",children:e.jsxs(q,{children:[e.jsxs(G,{children:[e.jsx(Y,{children:"Edit Payment"}),e.jsx(H,{children:"Update the payment details below"})]}),e.jsx(J,{children:e.jsxs("form",{onSubmit:$,className:"space-y-6",children:[e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"clientId",children:"Client *"}),e.jsxs(j,{value:t.clientId,onValueChange:a=>n({...t,clientId:a}),disabled:!0,children:[e.jsx(N,{children:e.jsx(w,{placeholder:"Select a client"})}),e.jsx(P,{children:Array.isArray(p)&&p.map(a=>e.jsx(D,{value:a.id,children:a.companyName||a.contactPerson},a.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"invoiceId",children:"Invoice *"}),e.jsxs(j,{value:t.invoiceId,onValueChange:a=>n({...t,invoiceId:a}),disabled:!0,children:[e.jsx(N,{children:e.jsx(w,{placeholder:"Select an invoice"})}),e.jsx(P,{children:Array.isArray(m)&&m.map(a=>e.jsx(D,{value:a.id,children:a.invoiceNumber},a.id))})]})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"amount",children:"Amount (Ksh) *"}),e.jsx(I,{id:"amount",type:"number",placeholder:"0.00",value:t.amount,onChange:a=>n({...t,amount:a.target.value}),step:"0.01",min:"0"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"paymentDate",children:"Payment Date *"}),e.jsx(I,{id:"paymentDate",type:"date",value:t.paymentDate,onChange:a=>n({...t,paymentDate:a.target.value})})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"paymentMethod",children:"Payment Method *"}),e.jsxs(j,{value:t.paymentMethod,onValueChange:a=>n({...t,paymentMethod:a}),children:[e.jsx(N,{children:e.jsx(w,{placeholder:"Select payment method"})}),e.jsx(P,{children:Z().map(a=>e.jsx(D,{value:a.value,children:a.label},a.value))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"chartOfAccountId",children:"Chart of Account"}),e.jsx(X,{accounts:T,value:t.chartOfAccountId,onChange:a=>n({...t,chartOfAccountId:a}),placeholder:"Select account (optional)",noneLabel:"None"})]})]}),e.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"referenceNumber",children:"Reference Number"}),e.jsx(I,{id:"referenceNumber",placeholder:"e.g., TXN123456",value:t.referenceNumber,onChange:a=>n({...t,referenceNumber:a.target.value})})]})}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(o,{htmlFor:"notes",children:"Notes"}),e.jsx(W,{id:"notes",placeholder:"Add any additional notes about this payment",value:t.notes,onChange:a=>n({...t,notes:a.target.value}),rows:4})]}),e.jsxs("div",{className:"flex gap-2 justify-between",children:[e.jsx("div",{className:"flex gap-2",children:e.jsxs(u,{type:"button",variant:"destructive",onClick:L,disabled:v.isPending,children:[v.isPending?e.jsx(h,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(ae,{className:"mr-2 h-4 w-4"}),"Delete"]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(u,{type:"button",variant:"outline",onClick:()=>y("/payments"),children:[e.jsx(te,{className:"mr-2 h-4 w-4"}),"Cancel"]}),e.jsxs(u,{type:"button",variant:"outline",onClick:k,disabled:C,children:[C?e.jsx(h,{className:"mr-2 h-4 w-4 animate-spin"}):e.jsx(se,{className:"mr-2 h-4 w-4"}),"Download PDF"]}),e.jsxs(u,{type:"submit",disabled:b.isPending,children:[b.isPending&&e.jsx(h,{className:"mr-2 h-4 w-4 animate-spin"}),"Update Payment"]})]})]})]})})]})})}):null}export{ge as default};
