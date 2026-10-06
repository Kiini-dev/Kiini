import pathlib
import re

root = pathlib.Path('.')
files = [p for p in root.rglob('*') if p.suffix.lower() in {'.html', '.txt', '.md'} and ('templates' in str(p.parts) or 'email-templates' in str(p.parts))]

special_replacements = {
    'client@email.com': '[CLIENT_EMAIL]',
    'customer@email.com': '[CUSTOMER_EMAIL]',
    'payer@email.com': '[PAYER_EMAIL]',
    'vendor@email.com': '[VENDOR_EMAIL]',
    'supplier@email.com': '[SUPPLIER_EMAIL]',
    'employee@email.com': '[EMPLOYEE_EMAIL]',
    'clientemailcom': '[CLIENT_EMAIL]',
    'customeremailcom': '[CUSTOMER_EMAIL]',
    'payeremailcom': '[PAYER_EMAIL]',
    'vendoremailcom': '[VENDOR_EMAIL]',
    'supplieremailcom': '[SUPPLIER_EMAIL]',
    'employeeemailcom': '[EMPLOYEE_EMAIL]',
    'customer phone': '[CUSTOMER_PHONE]',
    'customer address': '[CUSTOMER_ADDRESS]',
    'customer name': '[CUSTOMER_NAME]',
    'vendor company name': '[VENDOR_COMPANY_NAME]',
    'tax number': '[TAX_NUMBER]',
    'tax id': '[TAX_ID]',
    'purchase date': '[PURCHASE_DATE]',
    'full delivery address': '[FULL_DELIVERY_ADDRESS]',
    'billing address': '[BILLING_ADDRESS]',
}

def normalize_placeholder(match: re.Match) -> str:
    token = match.group(1)
    lower = token.lower()
    if lower in special_replacements:
        return special_replacements[lower]
    normalized = token.upper()
    normalized = re.sub(r'[\s/-]+', '_', normalized)
    normalized = re.sub(r'[^A-Z0-9_]', '', normalized)
    normalized = re.sub(r'_+', '_', normalized)
    return f'[{normalized}]'

# Normalize any bracketed token in templates and email templates
pattern = re.compile(r'\[([^\]]+)\]')

for path in files:
    text = path.read_text(encoding='utf-8', errors='ignore')
    new_text = pattern.sub(normalize_placeholder, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'Updated {path}')
print('Done')
