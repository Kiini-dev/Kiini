import 'dotenv/config';
import { renderInvoiceTemplate } from './server/utils/template-renderer';
import * as fs from 'fs';

async function testRender() {
  const invoiceId = '8d6cd44e-76e8-49f3-b057-49ff0af06434';
  console.log('[TEST] Starting invoice render for ID:', invoiceId);
  
  try {
    const result = await renderInvoiceTemplate(invoiceId, 'default-org');
    
    if (result) {
      console.log('[SUCCESS] Render completed');
      console.log('[LENGTH] HTML output length:', result.html.length);
      
      // Save the full HTML to a file for inspection
      fs.writeFileSync('invoice-output.html', result.html, 'utf-8');
      console.log('[SAVED] Full HTML saved to invoice-output.html');
      
      // Extract key sections for inspection
      const html = result.html;
      
      // Find the CLIENT_NAME and CLIENT_COMPANY area
      const clientSection = html.substring(
        html.indexOf('Customer Name:'),
        html.indexOf('Customer Name:') + 800
      );
      console.log('\n[CLIENT_SECTION]');
      console.log(clientSection);
      
      // Find the TERMS and TOTALS area
      const termsIdx = html.indexOf('Terms');
      if (termsIdx > 0) {
        const termsSection = html.substring(termsIdx, Math.min(termsIdx + 600, html.length));
        console.log('\n[TERMS_SECTION]');
        console.log(termsSection);
      }
      
      // Find the PAYMENT section
      const paymentIdx = html.indexOf('Payment Instructions') || html.indexOf('PAYMENT');
      if (paymentIdx > 0) {
        const paymentSection = html.substring(paymentIdx, Math.min(paymentIdx + 600, html.length));
        console.log('\n[PAYMENT_SECTION]');
        console.log(paymentSection);
      }
      
      // Check for actual resolved values
      console.log('\n[RESOLVED_VALUES_CHECK]');
      console.log('Company Name: "' + (html.match(/KIINI[^<]*/)?.[0] || 'NOT FOUND') + '"');
      console.log('Client Name contains Mzee Nthiga:', html.includes('Mzee Nthiga'));
      console.log('Client Company contains Red Seal Homes:', html.includes('Red Seal Homes'));
      console.log('Invoice Number: "' + (html.match(/INV-[0-9]+/)?.[0] || 'NOT FOUND') + '"');
      console.log('Has logo image tag:', html.includes('<img') && html.includes('data:image'));
      
    } else {
      console.log('[ERROR] Render returned null');
    }
  } catch (error: any) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

testRender();
