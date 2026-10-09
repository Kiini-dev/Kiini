const p=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),b=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"),m=e=>(e||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2});function d(e){return e.trim().replace(/^[{\[$\s]+|[}\]$\s]+$/g,"").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/[\s\-.]+/g,"_").replace(/_+/g,"_").toLowerCase()}function u(e){const t=e.currency||"KES",n=(e.items||[]).map(o=>`<tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${o.description||""}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${o.quantity||0}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${t} ${m(o.unitPrice)}</td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">${t} ${m(o.total)}</td>
        </tr>`).join("");return{rows:n,table:`
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.9em;">
        <thead><tr style="background:#f3f4f6;">
          <th style="text-align:left;padding:10px;border-bottom:2px solid #d1d5db;">Description</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Qty</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Rate</th>
          <th style="text-align:right;padding:10px;border-bottom:2px solid #d1d5db;">Total</th>
        </tr></thead>
        <tbody>${n}</tbody>
      </table>`}}function g(e){const t=e.currency||"KES",{rows:n,table:o}=u(e),i={company_name:e.companyName,company_email:e.companyEmail,company_phone:e.companyPhone,company_website:e.companyWebsite,company_address:e.companyAddress,client_name:e.clientName,client_company:e.clientCompanyName||e.clientName,client_company_name:e.clientCompanyName||e.clientName,clientCompany:e.clientCompanyName||e.clientName,clientCompanyName:e.clientCompanyName||e.clientName,client_email:e.clientEmail,client_phone:e.clientPhone,client_address:e.clientAddress,document_type:e.documentType,document_number:e.documentNumber,invoice_number:e.documentNumber,estimate_number:e.documentNumber,quotation_number:e.documentNumber,receipt_number:e.documentNumber,credit_note_number:e.documentNumber,debit_note_number:e.documentNumber,po_number:e.documentNumber,lpo_number:e.documentNumber,rfq_number:e.documentNumber,work_order_number:e.documentNumber,claim_number:e.documentNumber,service_invoice_number:e.documentNumber,document_date:e.documentDate,invoice_date:e.documentDate,estimate_date:e.documentDate,quotation_date:e.documentDate,receipt_date:e.documentDate,credit_note_date:e.documentDate,debit_note_date:e.documentDate,po_date:e.documentDate,lpo_date:e.documentDate,rfq_date:e.documentDate,work_order_date:e.documentDate,claim_date:e.documentDate,service_date:e.documentDate,todays_date:new Date().toISOString().split("T")[0],due_date:e.dueDate,expiry_date:e.dueDate,valid_until:e.dueDate,delivery_date:e.dueDate,deadline_date:e.dueDate,end_date:e.dueDate,issue_date:e.documentDate,payment_method:e.paymentMethod,reference_number:e.referenceNumber,kra_pin:e.kraPIN,subtotal:`${t} ${m(e.subtotal)}`,sub_total:`${t} ${m(e.subtotal)}`,tax:`${t} ${m(e.tax)}`,tax_amount:`${t} ${m(e.tax)}`,total:`${t} ${m(e.total)}`,total_amount:`${t} ${m(e.total)}`,raw_subtotal:String(e.subtotal||0),raw_tax:String(e.tax||0),raw_total:String(e.total||0),currency:t,notes:e.notes,terms_and_conditions:e.termsAndConditions,terms:e.termsAndConditions,bank_name:e.bankName,bank_branch:e.bankBranch,bank_account:e.bankAccount,bank_account_name:e.bankAccountName,mpesa_paybill:e.mpesaPaybill,mpesa_account_number:e.mpesaAccountNumber,items_table:o,line_items_table:o,items_rows:n,line_items_rows:n,items_html:o,line_items_html:o,companyinfo_companyname:e.companyName,companyinfo_companyemail:e.companyEmail,companyinfo_companyphone:e.companyPhone,companyinfo_companyaddress:e.companyAddress,company_logo:e.companyLogo,app_logo:e.companyLogo,companylogo:e.companyLogo,company_logo_url:e.companyLogo,companyinfo_logo:e.companyLogo,"company.logo":e.companyLogo,"company.logo_url":e.companyLogo,logo_url:e.companyLogo,logo:e.companyLogo},s={};return Object.entries(i).forEach(([c,l])=>{s[d(c)]=l==null?"":String(l)}),Object.entries(e.additionalFields||{}).forEach(([c,l])=>{s[d(c)]=b(l)}),s}function y(e,t){const n=g(t);let o=e.replace(/\{\{\s*([^{}]+)\s*\}\}/g,(i,s)=>n[d(s)]??"").replace(/\$\{\s*([^{}]+)\s*\}/g,(i,s)=>n[d(s)]??"").replace(/\[\s*([^\[\]]+)\s*\]/g,(i,s)=>n[d(s)]??i);if(Object.entries(n).forEach(([i,s])=>{const c=i.toUpperCase();o=o.replace(new RegExp(`\\[${p(c)}\\]`,"g"),s)}),!/(items_table|line_items_table|items_rows|line_items_rows)/i.test(e)){const i=n.line_items_rows||"";o=o.replace(/<tbody[^>]*>\s*<\/tbody>/i,`<tbody>${i}</tbody>`)}return o}function x(e){const t=e.currency||"KES";if(e.customTemplateHtml){const r=y(e.customTemplateHtml,e);return`<html><head><title>${e.documentType.toUpperCase()} ${e.documentNumber}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#333;background:#fff}
      table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #d1d5db}th{background:#f3f4f6;font-weight:600}
      @media print{body{padding:20px}.no-print{display:none!important}}</style></head>
      <body><div style="max-width:900px;margin:0 auto;">${r}</div>
      <script>window.onload=()=>{setTimeout(()=>{window.print();},100)};<\/script></body></html>`}const n=e.companyLogo?`<img src="${e.companyLogo}" style="max-height: 80px; margin-bottom: 15px;" />`:`<div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">${(e.companyName||e.documentType).toUpperCase()}</div>`,o=e.documentType==="invoice"?"INVOICE":e.documentType==="estimate"?"QUOTATION":"RECEIPT",i=e.termsAndConditions||"",s=e.taxType==="inclusive"?"Tax (Inclusive):":"Tax (Exclusive):";e.documentType!=="receipt"&&i&&`${i}`;let c="";if(e.bankDetailsHtml)c=`
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9; font-size: 0.85em; color: #555;">
        ${e.bankDetailsHtml}
      </div>`;else{const r=e.bankName?`
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;">
        <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 6px;">Bank Details</div>
        <div style="font-size: 0.85em; color: #555;">
          Bank: ${e.bankName}<br>
          Branch: ${e.bankBranch||"N/A"}<br>
          Account: ${e.bankAccount||"N/A"}<br>
          Name: ${e.bankAccountName||"N/A"}
        </div>
      </div>`:"",a=e.mpesaPaybill?`
      <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; background: #f9f9f9;">
        <div style="font-weight: 600; font-size: 0.9em; margin-bottom: 6px;">M-Pesa Payment</div>
        <div style="font-size: 0.85em; color: #555;">
          Paybill: ${e.mpesaPaybill}<br>
          Account: ${e.mpesaAccountNumber||"N/A"}
        </div>
      </div>`:"";c=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">${r}${a}</div>`}const l=c?`
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.95em;">Payment Information</div>
      ${c}
    </div>
  `:"";return`
    <html>
      <head>
        <title>${o} ${e.documentNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
            background: #fff;
          }
          .document-container { max-width: 900px; margin: 0 auto; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px;
            align-items: start;
          }
          .company-info { 
            max-width: 50%;
            flex: 1;
          }
          .company-branding { margin-bottom: 15px; }
          .company-phone, .company-email, .company-website, .company-address {
            font-size: 0.85em;
            color: #666;
            margin: 3px 0;
          }
          .doc-details { 
            text-align: right;
            flex: 1;
          }
          .document-title { 
            font-size: 24px; 
            font-weight: bold;
            margin-bottom: 10px;
          }
          .doc-meta-row { 
            font-size: 0.9em;
            margin: 5px 0;
          }
          .doc-meta-label {
            font-weight: 600;
            color: #555;
          }
          .bill-to-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .section-label { 
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 0.9em;
            color: #333;
          }
          .client-info {
            font-size: 0.9em;
            line-height: 1.6;
            color: #555;
          }
          .client-info-item { margin: 3px 0; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            font-size: 0.9em;
          }
          th { 
            background: #f3f4f6; 
            text-align: left; 
            padding: 12px; 
            font-weight: 600;
            border-bottom: 2px solid #d1d5db;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb;
          }
          .text-right { text-align: right; }
          .totals-section { 
            width: 350px; 
            margin-left: auto; 
            margin-top: 20px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 0.9em;
          }
          .total-row span:last-child { text-align: right; }
          .subtotal-row { color: #666; }
          .tax-row { color: #666; }
          .grand-total { 
            font-weight: bold; 
            font-size: 1.1em; 
            border-top: 2px solid #d1d5db; 
            border-bottom: 2px solid #d1d5db;
            margin-top: 8px; 
            padding-top: 8px;
            padding-bottom: 8px;
            background: #f9f9f9;
          }
          .two-column-section { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 20px 0;
          }
          .section-content { 
            font-size: 0.9em; 
            color: #555;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 0.85em;
            color: #999;
          }
          .footer-contact { 
            display: flex;
            justify-content: space-around;
            margin-bottom: 10px;
            font-size: 0.9em;
          }
          .footer-contact-block { flex: 1; }
          .footer-contact-label { font-weight: 600; color: #333; }
          .footer-contact-detail { color: #666; font-size: 0.9em; }
          @media print { 
            body { padding: 20px; }
            .no-print { display: none !important; }
            .document-container { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <!-- HEADER -->
          <div class="header">
            <div class="company-info">
              <div class="company-branding">
                ${n}
              </div>
              <div class="company-phone">Phone: ${e.companyPhone||""}</div>
              <div class="company-email">Email: ${e.companyEmail||""}</div>
              <div class="company-website">Website: ${e.companyWebsite||""}</div>
              <div class="company-address">Address: ${e.companyAddress||""}</div>
            </div>
            <div class="doc-details">
              <div class="document-title">${o}</div>
              <div class="doc-meta-row"><span class="doc-meta-label">Number:</span> ${e.documentNumber}</div>
              <div class="doc-meta-row"><span class="doc-meta-label">Date:</span> ${e.documentDate}</div>
              ${e.dueDate?`<div class="doc-meta-row"><span class="doc-meta-label">Due Date:</span> ${e.dueDate}</div>`:""}
              ${e.paymentMethod?`<div class="doc-meta-row"><span class="doc-meta-label">Payment:</span> ${e.paymentMethod}</div>`:""}
              ${e.referenceNumber?`<div class="doc-meta-row"><span class="doc-meta-label">Reference:</span> ${e.referenceNumber}</div>`:""}
              ${e.kraPIN?`<div class="doc-meta-row"><span class="doc-meta-label">KRA PIN:</span> ${e.kraPIN}</div>`:""}
            </div>
          </div>

          <!-- BILL TO SECTION -->
          <div class="bill-to-section">
            <div class="section-label">Bill To</div>
            <div class="client-info">
              <div class="client-info-item"><strong>${e.clientName}</strong></div>
              <div class="client-info-item">${e.clientPhone}</div>
              <div class="client-info-item">${e.clientEmail}</div>
              <div class="client-info-item">${e.clientAddress}</div>
            </div>
          </div>

          <!-- ITEMS TABLE -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(e.items)?e.items.map(r=>`
                <tr>
                  <td>${r.description||""}</td>
                  <td class="text-right">${r.quantity||0}</td>
                  <td class="text-right">${t} ${(r.unitPrice||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                  <td class="text-right">${t} ${(r.total||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                </tr>
              `).join(""):""}
            </tbody>
          </table>

          <!-- TOTALS -->
          <div class="totals-section">
            <div class="total-row subtotal-row">
              <span>Subtotal:</span>
              <span>${t} ${(e.subtotal||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            </div>
            <div class="total-row tax-row">
              <span>${s}</span>
              <span>${t} ${(e.tax||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Due:</span>
              <span>${t} ${(e.total||0).toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            </div>
          </div>

          <!-- TWO COLUMN SECTION: TERMS & CONDITIONS + PAYMENT INFO (For non-receipts) -->
          ${e.documentType!=="receipt"?`
          <div class="two-column-section">
            <div>
              ${i?`
              <div style="margin-top: 30px; page-break-inside: avoid;">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.95em;">Terms & Conditions</div>
                <div style="font-size: 0.85em; color: #555; white-space: pre-wrap; background: #f9f9f9; padding: 12px; border-radius: 4px; border-left: 3px solid #ff9f43; min-height: 100px;">
                  ${i}
                </div>
              </div>
              `:""}
            </div>
            <div>
              ${l}
            </div>
          </div>
          `:`
          <!-- PAYMENT INFO ONLY (For receipts) -->
          <div style="margin-top: 30px;">
            ${l}
          </div>
          `}

          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-contact">
              <div class="footer-contact-block">
                <div class="footer-contact-label">${e.companyName||""}</div>
                <div class="footer-contact-detail">${e.companyAddress||""}</div>
              </div>
              <div class="footer-contact-block">
                <div class="footer-contact-label">Contact</div>
                <div class="footer-contact-detail">${e.companyEmail||""}</div>
              </div>
            </div>
            <div style="font-size: 0.85em; margin-top: 10px;">For queries, contact us at ${e.companyEmail||""}</div>
            ${e.documentType==="receipt"?`
            <div style="font-size: 0.85em; color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              Inclusive of V.A.T where applicable<br>
              Thank you for your business.
            </div>
            `:`
            <div style="font-size: 0.85em; color: #666; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              This is a system generated ${o} and is digitally signed under ${e.companyName||"the issuing company"}.
            </div>
            `}
          </div>
        </div>

        <script>
          window.onload = () => { 
            setTimeout(() => {
              window.print();
            }, 100);
          };
        <\/script>
      </body>
    </html>
  `}export{x as g};
