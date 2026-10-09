import{r as m,j as e,s as F}from"./vendor-react-ui-CDYEcUL0.js";import{u as W,t as w,C as q,e as H,f as U,h as A,b as Y,J as O,K as z,L as G,M as Q,N as $,I as k,ab as V,ac as K,T as J,F as _,G as P,H as T,j as b,B,a9 as s,l as M}from"./index-D8-INyg9.js";import{M as X}from"./ModuleLayout-DS1IT_82.js";import{T as R}from"./textarea-ClmnIHNG.js";import{a as Z}from"./RichTextEditor-BULD9SZU.js";import{D as ee}from"./DocumentBlockEditor-C0XL7QwI.js";import{H as te}from"./HTMLEditor-Bm2XUqGd.js";import{L as d}from"./label-CYBPjLAu.js";import{C as ae,a as se,b as oe,c as ne,e as ie,f as re,d as le}from"./command-Bv5looW4.js";import{P as ce,a as de,b as me}from"./popover-CTsqJi06.js";import{M as E,N as L,aP as D,J as ue,as as pe,a as ye,a2 as he}from"./lucide-react-C64s4RRG.js";import"./rich-editor-DQKc7IGv.js";import"./api-client-BsgT-Ymu.js";import"./date-utils-CH9B62Ph.js";import"./purify.es-4eNOHKSq.js";const I={general:{label:"General",templates:[{id:"thank-you",name:"Thank You",subject:"Thank You for Your Business",body:`Dear Client,

Thank you for your business. We appreciate your continued support.

Best regards,
${s}`,category:"general",type:"both"},{id:"update",name:"Client Update",subject:"Important Update",body:`Dear Client,

We hope you are doing well. Please find the latest updates below.

Best regards,
${s}`,category:"general",type:"both"},{id:"follow-up",name:"Follow Up",subject:"Following Up",body:`Dear Client,

I wanted to follow up on our recent conversation. Please let me know if you have any questions.

Best regards,
${s}`,category:"general",type:"both"},{id:"welcome",name:"Welcome",subject:"Welcome to "+s,body:`Dear Client,

Welcome to ${s}! We are excited to have you on board.

Please don't hesitate to reach out if you need anything.

Best regards,
${s}`,category:"general",type:"email"},{id:"feedback-request",name:"Feedback Request",subject:"We Would Love Your Feedback",body:`Dear Client,

Thank you for choosing ${s}. We would appreciate your feedback on your recent experience.

Best regards,
${s}`,category:"general",type:"email"},{id:"account-update",name:"Account Update",subject:"Your Account Has Been Updated",body:`Dear Client,

Your account details have been updated successfully. Please contact us if you did not request this change.

Best regards,
${s}`,category:"general",type:"email"}]},financial:{label:"Financial / Invoicing",templates:[{id:"invoice-reminder",name:"Invoice Reminder",subject:"Invoice Reminder - Payment Due",body:`Dear Client,

This is a friendly reminder that your invoice is due. Please arrange payment at your earliest convenience.

If you have already made the payment, please disregard this message.

Best regards,
${s}`,category:"financial",type:"both"},{id:"payment-received",name:"Payment Received",subject:"Payment Received - Thank You",body:`Dear Client,

Thank you for your payment. We have received and processed it successfully.

Best regards,
${s}`,category:"financial",type:"both"},{id:"overdue-notice",name:"Overdue Notice",subject:"Overdue Payment Notice",body:`Dear Client,

We would like to bring to your attention that your payment is now overdue. Please arrange payment as soon as possible to avoid any disruptions.

Best regards,
${s}`,category:"financial",type:"email"},{id:"receipt-sent",name:"Receipt Sent",subject:"Your Receipt",body:`Dear Client,

Please find your receipt attached. Thank you for your payment.

Best regards,
${s}`,category:"financial",type:"email"},{id:"payment-instructions",name:"Payment Instructions",subject:"Payment Instructions",body:`Dear Client,

Please find our payment instructions below. Include your invoice number as the payment reference.

Best regards,
${s}`,category:"financial",type:"email"}]},estimates:{label:"Estimates & Proposals",templates:[{id:"new-estimate",name:"New Estimate",subject:"Your Estimate is Ready",body:`Dear Client,

We have prepared an estimate for you. Please review the details and let us know if you'd like to proceed.

Best regards,
${s}`,category:"estimates",type:"email"},{id:"proposal-sent",name:"Proposal Sent",subject:"Proposal for Your Review",body:`Dear Client,

Please find our proposal attached for your review. We look forward to the opportunity to work with you.

Best regards,
${s}`,category:"estimates",type:"email"},{id:"quote-follow-up",name:"Quote Follow Up",subject:"Following Up on Your Quote",body:`Dear Client,

I wanted to follow up on the quote we sent recently. Please let us know if you have any questions or would like to proceed.

Best regards,
${s}`,category:"estimates",type:"both"}]},projects:{label:"Projects",templates:[{id:"project-kickoff",name:"Project Kickoff",subject:"Project Kickoff",body:`Dear Client,

We are excited to kick off your project. Below are the key details and next steps.

Best regards,
${s}`,category:"projects",type:"email"},{id:"project-update",name:"Project Status Update",subject:"Project Status Update",body:`Dear Client,

Here is an update on the current status of your project.

Best regards,
${s}`,category:"projects",type:"both"},{id:"project-complete",name:"Project Completed",subject:"Project Completed Successfully",body:`Dear Client,

We are pleased to inform you that your project has been completed successfully. Please review the deliverables and let us know your feedback.

Best regards,
${s}`,category:"projects",type:"email"}]},contracts:{label:"Contracts",templates:[{id:"contract-new",name:"New Contract",subject:"New Contract for Your Review",body:`Dear Client,

A new contract has been prepared for you. Please review the terms and sign at your convenience.

Best regards,
${s}`,category:"contracts",type:"email"},{id:"contract-renewal",name:"Contract Renewal",subject:"Contract Renewal Notice",body:`Dear Client,

Your contract is due for renewal. Please review and confirm if you'd like to continue.

Best regards,
${s}`,category:"contracts",type:"both"}]},meetings:{label:"Meetings & Appointments",templates:[{id:"meeting-invite",name:"Meeting Invitation",subject:"Meeting Invitation",body:`Dear Client,

You are invited to a meeting. Please see the details below and confirm your attendance.

Best regards,
${s}`,category:"meetings",type:"email"},{id:"meeting-reminder",name:"Meeting Reminder",subject:"Meeting Reminder",body:`Dear Client,

This is a reminder about your upcoming meeting. Please ensure you are available.

Best regards,
${s}`,category:"meetings",type:"both"},{id:"meeting-follow-up",name:"Meeting Follow Up",subject:"Follow Up from Our Meeting",body:`Dear Client,

Thank you for your time during our meeting. Here is a summary of the key points discussed.

Best regards,
${s}`,category:"meetings",type:"email"},{id:"meeting-reschedule",name:"Meeting Reschedule",subject:"Request to Reschedule Our Meeting",body:`Dear Client,

We need to reschedule our upcoming meeting. Please share a convenient alternative time.

Best regards,
${s}`,category:"meetings",type:"email"}]},sms:{label:"SMS Templates",templates:[{id:"sms-reminder",name:"Payment Reminder (SMS)",subject:"",body:`Hi, this is a reminder that your payment is due. Please arrange payment. - ${s}`,category:"sms",type:"sms"},{id:"sms-confirmation",name:"Appointment Confirmation (SMS)",subject:"",body:`Hi, your appointment has been confirmed. We look forward to seeing you. - ${s}`,category:"sms",type:"sms"},{id:"sms-thank-you",name:"Thank You (SMS)",subject:"",body:`Thank you for your business! We appreciate your support. - ${s}`,category:"sms",type:"sms"},{id:"sms-update",name:"Status Update (SMS)",subject:"",body:`Hi, your request has been updated. Log in for details. - ${s}`,category:"sms",type:"sms"},{id:"sms-delivery",name:"Delivery Update (SMS)",subject:"",body:`Hi, your delivery update is ready. Please contact us if you have any questions. - ${s}`,category:"sms",type:"sms"}]}};function be({commType:u,onSelect:f}){const[g,j]=m.useState(!1),[p,y]=m.useState(""),{data:a}=w.emailTemplates.list.useQuery(void 0,{enabled:u==="email"}),x=(a||[]).map(o=>({id:o.id,name:o.name,subject:o.subject||"",body:o.htmlBody||o.body||"",htmlBody:o.htmlBody||o.body||"",category:o.category||"general",type:"email"})),N=u==="email"&&x.length>0?{...I,persisted:{label:"Saved Email Templates",templates:x}}:I,v=m.useMemo(()=>{const o={};for(const[l,h]of Object.entries(N)){const n=h.templates.filter(c=>c.type==="both"||c.type===u);if(n.length>0){const c=p?n.filter(t=>t.name.toLowerCase().includes(p.toLowerCase())||t.category.toLowerCase().includes(p.toLowerCase())):n;c.length>0&&(o[l]={label:h.label,templates:c})}}return o},[u,p,a]),S=Object.values(v).reduce((o,l)=>o+l.templates.length,0);return e.jsxs(ce,{open:g,onOpenChange:j,children:[e.jsx(de,{asChild:!0,children:e.jsxs(B,{type:"button",variant:"outline",role:"combobox","aria-expanded":g,className:"w-full justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ye,{size:16}),e.jsx("span",{children:"Select a template..."})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(M,{variant:"secondary",className:"text-xs",children:[S," templates"]}),e.jsx(he,{size:14,className:"opacity-50"})]})]})}),e.jsx(me,{className:"w-[500px] p-0",align:"start",children:e.jsxs(ae,{children:[e.jsx(se,{placeholder:"Search templates...",value:p,onValueChange:y}),e.jsxs(oe,{className:"max-h-[400px]",children:[e.jsx(ne,{children:"No templates found."}),Object.entries(v).map(([o,l],h)=>e.jsxs(F.Fragment,{children:[h>0&&e.jsx(ie,{}),e.jsx(re,{heading:l.label,children:l.templates.map(n=>e.jsx(le,{value:`${n.name} ${n.category}`,onSelect:()=>{f(n),j(!1),y("")},className:"cursor-pointer",children:e.jsxs("div",{className:"flex flex-col gap-0.5 flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"font-medium text-sm",children:n.name}),n.type==="sms"&&e.jsx(M,{variant:"outline",className:"text-[10px] px-1.5 py-0",children:"SMS"}),n.type==="email"&&e.jsx(M,{variant:"outline",className:"text-[10px] px-1.5 py-0",children:"Email"})]}),n.subject&&e.jsx("span",{className:"text-xs text-muted-foreground truncate max-w-[400px]",children:n.subject})]})},n.id))})]},o))]})]})})]})}function $e(){const[,u]=W(),f=m.useRef(null),[g,j]=m.useState(!1),[p,y]=m.useState("richtext"),[a,x]=m.useState({type:"email",recipient:"",recipients:"",subject:"",body:"",sendAt:new Date().toISOString().split("T")[0]}),N=w.communications.sendEmail.useMutation(),v=w.communications.sendSms.useMutation();m.useEffect(()=>{const t=new URLSearchParams(window.location.search),i=t.get("to")||"",r=t.get("subject")||"";!i&&!r||x(C=>({...C,recipient:i||C.recipient,subject:r||C.subject,type:i&&i.includes("@")?"email":C.type}))},[]);const{data:S=[]}=w.clients?.list?.useQuery?.({limit:1e3,offset:0})||{data:[]},o=(t,i)=>{x(r=>({...r,[t]:i}))},l=()=>a.type==="email"&&!a.subject.trim()?(b.error("Subject is required for emails"),!1):a.body.trim()?!a.recipient.trim()&&!a.recipients.trim()?(b.error("At least one recipient is required"),!1):!0:(b.error("Message body is required"),!1),h=async t=>{if(t.preventDefault(),!!l()){j(!0);try{const i=a.recipients.split(",").map(r=>r.trim()).filter(r=>r.length>0);a.recipient&&i.push(a.recipient.trim());for(const r of i)a.type==="email"?await N.mutateAsync({to:r,subject:a.subject||"Email Communication",body:a.body,cc:void 0,bcc:void 0}):await v.mutateAsync({phoneNumber:r,message:a.body,recipientId:r});b.success(`Communication${i.length>1?"s":""} queued successfully`),u("/communications")}catch(i){console.error("Failed to create communication:",i),b.error("Failed to create communication")}finally{j(!1)}}},n=t=>{switch(t){case"email":return e.jsx(E,{size:16});case"sms":return e.jsx(L,{size:16});default:return e.jsx(pe,{size:16})}},c=S.filter(t=>t.name?.toLowerCase().includes(a.recipient.toLowerCase())||t.email?.toLowerCase().includes(a.recipient.toLowerCase()));return e.jsx(X,{title:"Create Communication",description:"Send emails, SMS, or other communications to your clients",icon:e.jsx(ue,{className:"w-6 h-6"}),breadcrumbs:[{label:"Dashboard",href:"/crm-home"},{label:"Communications",href:"/communications"},{label:"Create"}],backLink:{label:"Communications",href:"/communications"},children:e.jsx("div",{className:"space-y-6 p-6",children:e.jsxs(q,{children:[e.jsxs(H,{children:[e.jsx(U,{children:"Communication Details"}),e.jsx(A,{children:"Fill in the details below to send a new communication"})]}),e.jsx(Y,{children:e.jsxs("form",{ref:f,onSubmit:h,className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Communication Type *"}),e.jsxs(O,{value:a.type,onValueChange:t=>o("type",t),children:[e.jsx(z,{children:e.jsx(G,{})}),e.jsxs(Q,{children:[e.jsx($,{value:"email",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(E,{size:14})," Email"]})}),e.jsx($,{value:"sms",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(L,{size:14})," SMS"]})})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Send At"}),e.jsx(k,{type:"date",value:a.sendAt,onChange:t=>o("sendAt",t.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Schedule Later?"}),e.jsxs("div",{className:"flex items-center gap-2 pt-2",children:[e.jsx("input",{type:"checkbox",id:"schedule",defaultChecked:!1,className:"w-4 h-4"}),e.jsx(d,{htmlFor:"schedule",className:"cursor-pointer text-sm",children:"Schedule for later"})]})]})]}),e.jsxs("div",{className:"space-y-4 border-t pt-4",children:[e.jsx("h3",{className:"font-semibold",children:"Recipients *"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Recipient Email or Phone"}),e.jsxs("div",{className:"relative",children:[e.jsx(k,{placeholder:a.type==="email"?"Enter email address...":"Enter phone number...",value:a.recipient,onChange:t=>o("recipient",t.target.value),autoComplete:"off"}),a.recipient&&c.length>0&&e.jsx("div",{className:"absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10",children:c.slice(0,5).map(t=>e.jsxs("div",{className:"px-4 py-2 hover:bg-accent cursor-pointer",onClick:()=>{const i=a.type==="email"?t.email:t.phone||"";o("recipient",i)},children:[e.jsx("div",{className:"font-medium",children:t.name}),e.jsx("div",{className:"text-sm text-muted-foreground",children:a.type==="email"?t.email:t.phone})]},t.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Additional Recipients (comma-separated)"}),e.jsx(R,{placeholder:a.type==="email"?"email1@example.com, email2@example.com, ...":"+254712345678, +254987654321, ...",value:a.recipients,onChange:t=>o("recipients",t.target.value),rows:3}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Enter multiple recipients separated by commas"})]})]}),e.jsxs("div",{className:"space-y-4 border-t pt-4",children:[e.jsx("h3",{className:"font-semibold",children:"Message Content"}),a.type==="email"&&e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{children:"Subject *"}),e.jsx(k,{placeholder:"Enter email subject...",value:a.subject,onChange:t=>o("subject",t.target.value)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(d,{children:[a.type==="email"?"Email Body":"Message"," *"]}),e.jsx(V,{format:a.type==="email"?"html":"text",onSelect:t=>{o("body",K(a.body,t.content,a.type==="email"?"html":"text")),a.type==="email"&&y("richtext")}}),a.type==="email"?e.jsxs(J,{value:p,onValueChange:t=>y(t),className:"w-full",children:[e.jsxs(_,{className:"grid w-full grid-cols-3",children:[e.jsxs(P,{value:"block",className:"flex gap-2",children:[e.jsx(D,{className:"h-4 w-4"}),"Blocks"]}),e.jsxs(P,{value:"richtext",className:"flex gap-2",children:[e.jsx(D,{className:"h-4 w-4"}),"Rich Text"]}),e.jsxs(P,{value:"html",className:"flex gap-2",children:[e.jsx(D,{className:"h-4 w-4"}),"HTML"]})]}),e.jsx(T,{value:"block",className:"mt-4",children:e.jsx(ee,{value:a.body,onChange:t=>o("body",t),placeholder:"Design your email message using blocks...",minHeight:"300px"})}),e.jsx(T,{value:"richtext",className:"mt-4",children:e.jsx(Z,{value:a.body,onChange:t=>o("body",t),placeholder:"Enter your email message here...",minHeight:"300px",enhanced:!0})}),e.jsx(T,{value:"html",className:"mt-4",children:e.jsx(te,{value:a.body,onChange:t=>o("body",t),placeholder:"Enter HTML email content...",minHeight:"300px",height:"400px"})})]}):e.jsx(R,{placeholder:"Enter your SMS message here (160 characters)...",value:a.body,onChange:t=>o("body",t.target.value),rows:8,maxLength:160}),a.type==="sms"&&e.jsxs("p",{className:"text-xs text-muted-foreground",children:[a.body.length,"/160 characters"]})]})]}),e.jsxs("div",{className:"space-y-4 border-t pt-4",children:[e.jsx("h3",{className:"font-semibold",children:"Quick Templates"}),e.jsx(be,{commType:a.type,onSelect:t=>{o("body",t.body),a.type==="email"&&t.subject&&o("subject",t.subject),a.type==="email"&&t.htmlBody&&y("html"),b.success(`Template "${t.name}" applied`)}})]}),e.jsxs("div",{className:"flex gap-4 justify-end border-t pt-6",children:[e.jsx(B,{type:"button",variant:"outline",onClick:()=>u("/communications"),children:"Cancel"}),e.jsxs(B,{type:"button",disabled:g,className:"flex items-center gap-2",onClick:()=>f.current?.requestSubmit(),children:[n(a.type),g?"Sending...":"Send Communication"]})]})]})})]})})})}export{$e as default};
