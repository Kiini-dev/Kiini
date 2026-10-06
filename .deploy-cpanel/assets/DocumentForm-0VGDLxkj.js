import{r as s,j as e}from"./vendor-react-ui-D_dP7EUb.js";import{t as A,x as tt,C as Te,a9 as Pe,o as z,p as R,q as B,r as Q,s as u,I as d,z as ue,B as D,aa as st,g as at}from"./index-Bmob1iPg.js";import{T as nt,a as it,b as Ie,c as E,d as lt,e as F}from"./table-Dn2XXFkd.js";import{L as o}from"./label-DONXMvoU.js";import{T as pe}from"./textarea-D5NWr3a1.js";import{C as ct,a as ot,b as rt}from"./collapsible-Bu1M_S6E.js";import{g as dt}from"./paymentMethods-r32LliAe.js";import{ah as mt,bz as xt,r as ut,a6 as pt,b as ht,aL as gt,aF as jt,L as vt}from"./lucide-react-CV8Hp_LM.js";function Pt({type:m,mode:S="create",onSave:he,onSend:ft,initialData:n,isLoading:Le=!1,isSaving:Z=!1}){const[k,Ae]=s.useState(n?.documentNumber||"");s.useEffect(()=>{n?.documentNumber&&Ae(n.documentNumber)},[n?.documentNumber]);const[N,Ee]=s.useState(n?.date||new Date().toISOString().split("T")[0]),[_,ge]=s.useState(n?.dueDate||""),[O,Fe]=s.useState(n?.dueDate?"manual":"auto"),[ee,ke]=s.useState(n?.dueDays??7),[g,je]=s.useState("existing"),[r,_e]=s.useState(n?.clientId||""),[te,qe]=s.useState(n?.clientName||""),[ve,Me]=s.useState(n?.clientEmail||""),[se,Ve]=s.useState(n?.clientAddress||""),[U,ze]=s.useState(""),[G,Re]=s.useState(""),[ae,Be]=s.useState(""),[H,Qe]=s.useState(""),[q,ne]=s.useState(n?.projectId||""),[ie,Oe]=s.useState(n?.category||"default"),[M,Ue]=s.useState(n?.notes||""),[$,le]=s.useState(n?.terms||""),[V,fe]=s.useState(n?.paymentDetails||""),[T,yt]=s.useState(n?.applyVAT??!0),[j,ye]=s.useState(n?.taxType||"exclusive"),[b,Ge]=s.useState(n?.vatPercentage??16),[ce,He]=s.useState(n?.paymentMethod||"mpesa"),[Ne,Ke]=s.useState(!1),[p,We]=s.useState(n?.documentDiscount??0),[x,oe]=s.useState(n?.lineItems||[{id:"1",sno:1,description:"",uom:"Pcs",qty:1,unitPrice:0,tax:0,discount:0,total:0}]),{data:be}=A.clients.list.useQuery({}),K=s.useMemo(()=>be||[],[be]),{data:re}=A.projects.list.useQuery({}),de=s.useMemo(()=>!re||!r?[]:re.filter(t=>t.clientId===r),[re,r]),{data:c}=A.settings.getCompanyInfo.useQuery({}),{data:we}=A.settings.getBankDetails.useQuery({}),{data:me}=A.settings.getByCategory.useQuery({category:"tax_rates"},{staleTime:300*1e3}),{data:P}=A.settings.getByCategory.useQuery({category:"invoice_settings"},{staleTime:300*1e3});s.useEffect(()=>{S==="create"&&me?.defaultRate&&Ge(parseFloat(me.defaultRate)||16)},[me,S]),s.useEffect(()=>{S==="create"&&P&&(P.defaultDueDays&&ke(parseInt(P.defaultDueDays)||7),P.termsAndConditions&&!$&&le(P.termsAndConditions))},[P,S]),s.useEffect(()=>{if(O==="auto"&&N){const t=new Date(N);t.setDate(t.getDate()+ee),ge(t.toISOString().split("T")[0])}},[N,ee,O]);const{symbol:h,position:Ye}=tt(),w=(t,a=2)=>st(t,h,Ye,{minimumFractionDigits:a,maximumFractionDigits:a});s.useEffect(()=>{if(r&&K.length>0){const t=K.find(a=>a.id===r);t&&(qe(t.companyName||""),Me(t.email||""),Ve(t.address||""))}},[r,K]),s.useEffect(()=>{r?q&&de.length>0&&(de.some(a=>a.id===q)||ne("")):ne("")},[r]),s.useEffect(()=>{S==="create"&&c&&we&&(!$&&n?.terms&&le(n.terms),!V&&n?.paymentDetails&&fe(n.paymentDetails))},[S,c,we,n?.terms,n?.paymentDetails]);const Ce=s.useCallback((t,a,f,C=0)=>{const i=t*a,l=i*C/100,y=i-l,I=y*f/100;return y+I},[]),{subtotal:W,lineDiscountTotal:v,vat:Y,grandTotal:J}=s.useMemo(()=>{const t=x.reduce((xe,L)=>xe+L.qty*L.unitPrice,0),a=x.reduce((xe,L)=>{const et=L.qty*L.unitPrice;return xe+et*(L.discount||0)/100},0),f=t-a,C=f*p/100,i=f-C;let l=i,y=0,I=i;return T&&(j==="inclusive"?(I=i,y=i-i/(1+b/100),l=I-y):(l=i,y=l*b/100,I=l+y)),{subtotal:l,lineDiscountTotal:a,vat:y,grandTotal:I}},[x,T,b,j,p]),Je=s.useCallback(()=>{oe(t=>[...t,{id:Date.now().toString(),sno:t.length+1,description:"",uom:"Pcs",qty:1,unitPrice:0,tax:0,discount:0,total:0}])},[]),X=s.useCallback((t,a,f)=>{oe(C=>C.map(i=>{if(i.id===t){const l={...i,[a]:f};return(a==="qty"||a==="unitPrice"||a==="tax"||a==="discount")&&(l.total=Ce(l.qty,l.unitPrice,l.tax,l.discount)),l}return i}))},[Ce]),De=s.useCallback(()=>({id:n?.id,documentNumber:k,type:m,date:N,dueDate:_,clientId:g==="new"?void 0:r,clientName:g==="new"?`${U} ${G}`.trim():te,clientEmail:g==="new"?H:ve,clientAddress:se,projectId:q,category:ie,lineItems:x,subtotal:W,vat:Y,grandTotal:J,documentDiscount:p,lineDiscountTotal:v,notes:M,terms:$,paymentDetails:V,applyVAT:T,taxType:j,vatPercentage:b,paymentMethod:ce,newClient:g==="new"?{firstName:U,lastName:G,companyName:ae,email:H}:void 0}),[k,m,N,_,r,g,te,ve,se,U,G,ae,H,q,ie,x,W,Y,J,p,v,M,$,V,T,j,b,ce,n?.id]),Xe=()=>{const t=window.open("","_blank");if(!t){at.error("Please allow popups to print");return}const a=m.toUpperCase(),f=c?.companyLogo?`<img src="${c.companyLogo}" style="max-height: 80px; margin-bottom: 15px;" />`:`<div class="document-title">${a}</div>`,C=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${a} ${k}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { max-width: 50%; }
            .document-title { font-size: 24px; font-weight: bold; color: #2563eb; }
            .doc-details { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; text-align: left; padding: 12px; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 8px; }
            .footer { margin-top: 60px; text-align: center; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
            .terms-section { margin-top: 40px; }
            .section-title { font-weight: bold; margin-bottom: 8px; font-size: 0.95em; }
            .section-content { white-space: pre-wrap; font-size: 0.9em; color: #444; margin-bottom: 20px; }
            .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .column-box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              ${f}
              <p style="font-size: 0.9em; margin-top: 10px;">
                ${c?.companyAddress||"Nairobi, Kenya"}<br>
                ${c?.companyCity||""} ${c?.companyCountry||""}<br>
                Email: ${c?.companyEmail||""}<br>
                Phone: ${c?.companyPhone||""}
              </p>
            </div>
            <div class="doc-details">
              <div class="document-title">${a}</div>
              <p><strong>Number:</strong> ${k}</p>
              <p><strong>Date:</strong> ${N}</p>
              ${_?`<p><strong>Due Date:</strong> ${_}</p>`:""}
            </div>
          </div>
          
          <div style="margin-bottom: 30px">
            <div class="section-title">Bill To:</div>
            <div class="section-content">${te}<br>${se}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Disc %</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${x.map(i=>`
                <tr>
                  <td>${i.description}</td>
                  <td class="text-right">${i.qty}</td>
                  <td class="text-right">${h} ${i.unitPrice.toLocaleString()}</td>
                  <td class="text-right">${i.discount||0}%</td>
                  <td class="text-right">${h} ${(i.qty*i.unitPrice*(1-(i.discount||0)/100)).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal:</span><span>${h} ${x.reduce((i,l)=>i+l.qty*l.unitPrice,0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
            ${v>0?`<div class="total-row"><span>Line Discounts:</span><span>-${h} ${v.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>`:""}
            ${p>0?`<div class="total-row"><span>Discount (${p}%):</span><span>-${h} ${((x.reduce((i,l)=>i+l.qty*l.unitPrice,0)-v)*p/100).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>`:""}
            <div class="total-row"><span>Net Amount:</span><span>${h} ${W.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
            ${T?`<div class="total-row"><span>VAT (${b}%) ${j==="inclusive"?"(Incl.)":"(Excl.)"}:</span><span>${h} ${Y.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>`:""}
            <div class="total-row grand-total"><span>Grand Total:</span><span>${h} ${J.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>
          </div>
          
          <div class="terms-section">
            <div class="two-column">
              <div class="column-box">
                <div class="section-title">Terms & Conditions:</div>
                <div class="section-content">${$}</div>
              </div>
              <div class="column-box">
                <div class="section-title">Payment Details:</div>
                <div class="section-content">${V}</div>
              </div>
            </div>
            
            ${M?`<div class="section-title">Notes:</div><div class="section-content">${M}</div>`:""}
          </div>
          
          <div class="footer">
            This is a system generated ${m} from ${c?.companyName||Pe}.
          </div>
          
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `;t.document.open(),t.document.write(C),t.document.close()};if(Le)return e.jsx("div",{className:"p-8 text-center",children:"Loading..."});const Se=m==="estimate"?"Estimate":m==="receipt"?"Receipt":m==="payment"?"Payment":"Invoice",$e={invoice:"Invoice Date",estimate:"Estimate Date",receipt:"Receipt Date",payment:"Payment Date"},Ze={invoice:"Due Date",estimate:"Valid Until",receipt:"Date",payment:"Due Date"};return e.jsxs("div",{className:"max-w-7xl mx-auto p-6 space-y-6",children:[e.jsxs(Te,{className:"p-6",children:[e.jsxs("div",{className:"flex justify-between mb-6",children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[c?.companyLogo?e.jsx("img",{src:c.companyLogo,alt:"Logo",className:"h-16 w-auto object-contain"}):e.jsx("h1",{className:"text-3xl font-bold text-primary",children:Se}),c?.companyLogo&&e.jsx("h1",{className:"text-xl font-bold text-primary",children:Se})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-bold",children:c?.companyName||Pe}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[c?.companyAddress||"Nairobi, Kenya",e.jsx("br",{}),c?.companyPhone||""]})]})]}),e.jsxs("div",{className:"space-y-4 mb-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(o,{className:"text-base font-semibold",children:"Client"}),e.jsxs("div",{className:"flex gap-1 text-sm",children:[e.jsx("button",{type:"button",className:`px-3 py-1 rounded-l-md border text-xs font-medium transition-colors ${g==="existing"?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/80"}`,onClick:()=>je("existing"),children:"Existing Client"}),e.jsx("button",{type:"button",className:`px-3 py-1 rounded-r-md border text-xs font-medium transition-colors ${g==="new"?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-muted/80"}`,onClick:()=>je("new"),children:"New Client"})]})]}),g==="existing"?e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Client *"}),e.jsxs(z,{value:r,onValueChange:_e,children:[e.jsx(R,{children:e.jsx(B,{placeholder:"Search or select client..."})}),e.jsx(Q,{children:K.map(t=>e.jsx(u,{value:t.id,children:e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsx(mt,{className:"h-3 w-3 text-muted-foreground"}),t.companyName||t.name||"Unknown Client"]})},t.id))})]})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Project"}),e.jsxs(z,{value:q,onValueChange:ne,disabled:!r,children:[e.jsx(R,{children:e.jsx(B,{placeholder:r?"Select project (optional)":"Select a client first"})}),e.jsxs(Q,{children:[e.jsx(u,{value:"none",children:"No Project"}),de.map(t=>e.jsx(u,{value:t.id,children:t.name||t.title},t.id))]})]})]})]}):e.jsxs("div",{className:"grid gap-3 p-4 bg-muted/30 rounded-lg border border-dashed",children:[e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Company Name"}),e.jsx(d,{value:ae,onChange:t=>Be(t.target.value),placeholder:"Company name (optional)"})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"First Name *"}),e.jsx(d,{value:U,onChange:t=>ze(t.target.value),placeholder:"First name"})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Last Name *"}),e.jsx(d,{value:G,onChange:t=>Re(t.target.value),placeholder:"Last name"})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Email *"}),e.jsx(d,{type:"email",value:H,onChange:t=>Qe(t.target.value),placeholder:"Email address"})]})]})]}),e.jsx(ue,{className:"my-4"}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsxs(o,{className:"text-right text-sm",children:[$e[m]||"Date"," *"]}),e.jsx(d,{type:"date",value:N,onChange:t=>Ee(t.target.value),className:"max-w-xs"})]}),m!=="receipt"&&e.jsxs("div",{className:"grid grid-cols-[140px_1fr_auto] items-center gap-3",children:[e.jsxs(o,{className:"text-right text-sm",children:[Ze[m]||"Due Date"," *"]}),O==="auto"?e.jsx(d,{value:`${$e[m]||"Date"} + ${ee} days`,readOnly:!0,className:"bg-muted cursor-not-allowed max-w-xs text-sm"}):e.jsx(d,{type:"date",value:_,onChange:t=>ge(t.target.value),className:"max-w-xs"}),e.jsxs(z,{value:O,onValueChange:t=>Fe(t),children:[e.jsx(R,{className:"w-[170px]",children:e.jsx(B,{})}),e.jsxs(Q,{children:[e.jsx(u,{value:"auto",children:"Set Automatically"}),e.jsx(u,{value:"manual",children:"Set Manually"})]})]})]}),m==="receipt"&&e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Payment Method"}),e.jsxs(z,{value:ce,onValueChange:He,children:[e.jsx(R,{className:"max-w-xs",children:e.jsx(B,{})}),e.jsx(Q,{children:dt().map(t=>e.jsx(u,{value:t.value,children:t.label},t.value))})]})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Category *"}),e.jsxs(z,{value:ie,onValueChange:Oe,children:[e.jsx(R,{className:"max-w-xs",children:e.jsx(B,{})}),e.jsxs(Q,{children:[e.jsx(u,{value:"default",children:"Default"}),e.jsx(u,{value:"services",children:"Services"}),e.jsx(u,{value:"products",children:"Products"}),e.jsx(u,{value:"consulting",children:"Consulting"}),e.jsx(u,{value:"maintenance",children:"Maintenance"})]})]})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-center gap-3",children:[e.jsx(o,{className:"text-right text-sm",children:"Number"}),e.jsx(d,{value:k,readOnly:!0,className:"bg-muted cursor-not-allowed font-mono max-w-xs",placeholder:"Generating..."})]})]}),e.jsx(ue,{className:"my-4"}),e.jsxs(ct,{open:Ne,onOpenChange:Ke,children:[e.jsx(ot,{asChild:!0,children:e.jsxs("button",{type:"button",className:"flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",children:[e.jsx("span",{children:"Additional Information"}),Ne?e.jsx(xt,{className:"h-4 w-4"}):e.jsx(ut,{className:"h-4 w-4"})]})}),e.jsxs(rt,{className:"space-y-4 pt-3",children:[e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-start gap-3",children:[e.jsx(o,{className:"text-right text-sm pt-2",children:"Notes"}),e.jsx(pe,{value:M,onChange:t=>Ue(t.target.value),rows:3,placeholder:"Additional notes..."})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-start gap-3",children:[e.jsx(o,{className:"text-right text-sm pt-2",children:"Terms"}),e.jsx(pe,{value:$,onChange:t=>le(t.target.value),rows:4,placeholder:"Terms and conditions..."})]}),e.jsxs("div",{className:"grid grid-cols-[140px_1fr] items-start gap-3",children:[e.jsx(o,{className:"text-right text-sm pt-2",children:"Payment Details"}),e.jsx(pe,{value:V,onChange:t=>fe(t.target.value),rows:4,placeholder:"Bank details, M-Pesa, etc..."})]})]})]})]}),e.jsxs(Te,{className:"p-6",children:[e.jsxs("div",{className:"flex justify-between mb-4",children:[e.jsx("h2",{className:"text-xl font-semibold",children:"Items"}),e.jsxs(D,{onClick:Je,size:"sm",children:[e.jsx(pt,{className:"h-4 w-4 mr-2"}),"Add Item"]})]}),e.jsxs(nt,{children:[e.jsx(it,{children:e.jsxs(Ie,{children:[e.jsx(E,{children:"Description"}),e.jsx(E,{className:"text-right",children:"Qty"}),e.jsx(E,{className:"text-right",children:"Rate"}),e.jsx(E,{className:"text-right",children:"Disc %"}),e.jsx(E,{className:"text-right",children:"Total"}),e.jsx(E,{className:"w-16 text-center",children:"Action"})]})}),e.jsx(lt,{children:x.map(t=>e.jsxs(Ie,{children:[e.jsx(F,{children:e.jsx(d,{value:t.description,onChange:a=>X(t.id,"description",a.target.value),placeholder:"Item description"})}),e.jsx(F,{className:"text-right",children:e.jsx(d,{type:"number",value:t.qty,onChange:a=>X(t.id,"qty",parseInt(a.target.value)||0),className:"text-right"})}),e.jsx(F,{className:"text-right",children:e.jsx(d,{type:"number",value:t.unitPrice,onChange:a=>X(t.id,"unitPrice",parseFloat(a.target.value)||0),className:"text-right"})}),e.jsx(F,{className:"text-right",children:e.jsx(d,{type:"number",value:t.discount,onChange:a=>X(t.id,"discount",parseFloat(a.target.value)||0),className:"text-right",min:0,max:100,placeholder:"0"})}),e.jsx(F,{className:"text-right font-mono",children:w(t.qty*t.unitPrice*(1-(t.discount||0)/100))}),e.jsx(F,{className:"text-center",children:e.jsx(D,{variant:"ghost",size:"icon",onClick:()=>oe(x.filter(a=>a.id!==t.id)),className:"h-8 w-8",children:e.jsx(ht,{className:"h-4 w-4 text-destructive"})})})]},t.id))})]}),e.jsx("div",{className:"flex justify-end mt-6",children:e.jsxs("div",{className:"w-80 space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between p-2 bg-muted rounded-md",children:[e.jsx(o,{className:"text-sm font-medium",children:"Tax Type"}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx(D,{variant:j==="exclusive"?"default":"outline",size:"sm",onClick:()=>ye("exclusive"),className:"h-7 text-xs",children:"Exclusive"}),e.jsx(D,{variant:j==="inclusive"?"default":"outline",size:"sm",onClick:()=>ye("inclusive"),className:"h-7 text-xs",children:"Inclusive"})]})]}),e.jsxs("div",{className:"space-y-2 px-2",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{className:"font-mono",children:w(x.reduce((t,a)=>t+a.qty*a.unitPrice,0))})]}),v>0&&e.jsxs("div",{className:"flex justify-between text-sm text-orange-600",children:[e.jsx("span",{children:"Line Discounts:"}),e.jsxs("span",{className:"font-mono",children:["-",w(v)]})]}),e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsxs("span",{className:"flex items-center gap-2",children:["Discount %:",e.jsx(d,{type:"number",value:p,onChange:t=>We(parseFloat(t.target.value)||0),className:"w-20 h-7 text-right text-xs",min:0,max:100,placeholder:"0"})]}),p>0&&e.jsxs("span",{className:"font-mono text-orange-600",children:["-",w((x.reduce((t,a)=>t+a.qty*a.unitPrice,0)-v)*p/100)]})]}),e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Net Amount:"}),e.jsx("span",{className:"font-mono",children:w(W)})]}),T&&e.jsxs("div",{className:"flex justify-between text-sm text-muted-foreground",children:[e.jsxs("span",{children:["VAT (",b,"%) ",j==="inclusive"?"(Incl.)":"(Excl.)",":"]}),e.jsx("span",{className:"font-mono",children:w(Y)})]}),e.jsx(ue,{}),e.jsxs("div",{className:"flex justify-between font-bold text-lg",children:[e.jsx("span",{children:"Grand Total:"}),e.jsx("span",{className:"font-mono",children:w(J)})]})]})]})})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("p",{className:"text-xs text-muted-foreground",children:[e.jsx("strong",{children:"* Required"}),"  |  Recurring options available after creation"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(D,{variant:"outline",onClick:Xe,children:[e.jsx(gt,{className:"mr-2 h-4 w-4"}),"Print"]}),e.jsxs(D,{variant:"outline",onClick:()=>he?.({...De(),status:"draft"}),disabled:Z,children:[e.jsx(jt,{className:"mr-2 h-4 w-4"}),"Save Draft"]}),e.jsxs(D,{onClick:()=>he?.(De()),disabled:Z,children:[Z&&e.jsx(vt,{className:"mr-2 h-4 w-4 animate-spin"}),"Save & Continue"]})]})]})]})}export{Pt as D};
