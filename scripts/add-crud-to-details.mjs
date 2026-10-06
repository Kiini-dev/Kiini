#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '../client/src/pages');

// List of detail pages to enhance with CRUD
const detailPages = [
  { file: 'EstimateDetails.tsx', module: 'Estimates' },
  { file: 'ReceiptDetails.tsx', module: 'Receipts' },
  { file: 'PaymentDetails.tsx', module: 'Payments' },
  { file: 'ExpenseDetails.tsx', module: 'Expenses' },
  { file: 'ProductDetails.tsx', module: 'Products' },
  { file: 'ServiceDetails.tsx', module: 'Services' },
  { file: 'EmployeeDetails.tsx', module: 'Employees' },
  { file: 'DepartmentDetails.tsx', module: 'Departments' },
  { file: 'AttendanceDetails.tsx', module: 'Attendance' },
  { file: 'PayrollDetails.tsx', module: 'Payroll' },
  { file: 'LeaveDetails.tsx', module: 'Leave' },
  { file: 'OpportunityDetails.tsx', module: 'Opportunities' },
  { file: 'ProposalDetails.tsx', module: 'Proposals' },
];

function addCrudToFile(filePath, moduleName) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if already has delete functionality
    if (content.includes('DeleteConfirmationModal')) {
      console.log(`✓ ${path.basename(filePath)} already has CRUD functionality`);
      return;
    }

    // Add useState import if not present
    if (!content.includes('import { useState }')) {
      content = content.replace(
        /import \{([^}]*)\} from "react";/,
        'import { useState, $1 } from "react";'
      );
    }

    // Add DeleteConfirmationModal import
    if (!content.includes('DeleteConfirmationModal')) {
      const dashboardImportIndex = content.indexOf('import DashboardLayout');
      if (dashboardImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', dashboardImportIndex);
        content = content.slice(0, endOfLine + 1) + 
                  'import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";\n' +
                  content.slice(endOfLine + 1);
      }
    }

    // Add toast import
    if (!content.includes('import { toast }')) {
      const lastImport = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImport);
      content = content.slice(0, endOfLastImport + 1) + 
                'import { toast } from "sonner";\n' +
                content.slice(endOfLastImport + 1);
    }

    // Add logDelete import
    if (!content.includes('logDelete')) {
      const lastImport = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImport);
      content = content.slice(0, endOfLastImport + 1) + 
                'import { logDelete } from "@/lib/activityLog";\n' +
                content.slice(endOfLastImport + 1);
    }

    // Add Trash2 icon if not present
    if (!content.includes('Trash2')) {
      content = content.replace(
        /from "lucide-react";/,
        ',\n  Trash2,\n} from "lucide-react";'
      );
    }

    // Add state hooks in component
    const componentStart = content.indexOf('export default function');
    const functionStart = content.indexOf('{', componentStart);
    const firstLine = content.indexOf('\n', functionStart);
    
    const stateHooks = `
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);`;
    
    if (!content.includes('isDeleteOpen')) {
      content = content.slice(0, firstLine + 1) + stateHooks + content.slice(firstLine);
    }

    // Add handleDelete function before return
    const returnIndex = content.indexOf('return (');
    if (!content.includes('const handleDelete')) {
      const handleDelete = `
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logDelete("${moduleName}", itemId || "", itemName);
      toast.success(\`\${itemName} has been deleted\`);
      setIsDeleteOpen(false);
      navigate("/${moduleName.toLowerCase()}");
    } catch (error) {
      toast.error("Failed to delete ${moduleName.toLowerCase()}");
    } finally {
      setIsDeleting(false);
    }
  };
`;
      content = content.slice(0, returnIndex) + handleDelete + '\n  ' + content.slice(returnIndex);
    }

    // Add Edit and Delete buttons to header (look for first Badge or similar)
    const badgeIndex = content.indexOf('<Badge');
    if (badgeIndex !== -1 && !content.includes('onClick={handleDelete}')) {
      const badgeEnd = content.indexOf('</Badge>', badgeIndex) + 8;
      const buttons = `
            <Button onClick={() => navigate(\`/${moduleName.toLowerCase()}/$\{itemId}/edit\`)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)} size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>`;
      content = content.slice(0, badgeEnd) + buttons + content.slice(badgeEnd);
    }

    // Add DeleteConfirmationModal before closing DashboardLayout
    const dashboardClose = content.lastIndexOf('</DashboardLayout>');
    if (dashboardClose !== -1 && !content.includes('DeleteConfirmationModal')) {
      const modal = `
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete ${moduleName.slice(0, -1)}"
        description="Are you sure you want to delete this ${moduleName.toLowerCase().slice(0, -1)}? This action cannot be undone."
        itemName={itemName}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        isDangerous={true}
      />
    `;
      content = content.slice(0, dashboardClose) + modal + content.slice(dashboardClose);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Added CRUD to ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

// Process all detail pages
console.log('Adding CRUD functionality to detail pages...\n');
detailPages.forEach(({ file, module }) => {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    addCrudToFile(filePath, module);
  } else {
    console.log(`⊘ ${file} not found (skipping)`);
  }
});

console.log('\n✓ CRUD enhancement complete!');

