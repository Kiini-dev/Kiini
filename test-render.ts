import 'dotenv/config';
import { renderInvoiceTemplate } from './server/utils/template-renderer';

async function testRender() {
  const invoiceId = '8d6cd44e-76e8-49f3-b057-49ff0af06434';
  console.log('[TEST] Starting invoice render for ID:', invoiceId);
  
  try {
    const result = await renderInvoiceTemplate(invoiceId, 'default-org');
    
    if (result) {
      console.log('[SUCCESS] Render completed');
      console.log('[LENGTH] HTML output length:', result.html.length);
      console.log('[TITLE]', result.title);
      
      // Check for key values
      console.log('[CHECK] Has Kiini:', result.html.includes('kiini') || result.html.includes('Kiini'));
      console.log('[CHECK] Has Mzee Nthiga:', result.html.includes('Mzee Nthiga'));
      console.log('[CHECK] Has Red Seal Homes:', result.html.includes('Red Seal Homes'));
      console.log('[CHECK] Has INV-000004:', result.html.includes('INV-000004'));
      console.log('[CHECK] Has logo img tag:', result.html.includes('<img') && result.html.includes('COMPANY_LOGO'));
      console.log('[CHECK] Has Terms token:', result.html.includes('{{TERMS') || result.html.includes('TERMS_AND_CONDITIONS'));
      
      // Check if key tokens are still unresolved
      console.log('[UNRESOLVED] {{COMPANY_NAME}}:', result.html.includes('{{COMPANY_NAME}}'));
      console.log('[UNRESOLVED] {{COMPANY_LOGO}}:', result.html.includes('{{COMPANY_LOGO}}'));
      console.log('[UNRESOLVED] {{CLIENT_COMPANY}}:', result.html.includes('{{CLIENT_COMPANY}}'));
      console.log('[UNRESOLVED] {{TERMS}}:', result.html.includes('{{TERMS}}'));
      
      // Print first 2000 chars
      console.log('\n[HTML_START]');
      console.log(result.html.substring(0, 2000));
      console.log('\n[HTML_END]\n');
    } else {
      console.log('[ERROR] Render returned null');
    }
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

testRender();
