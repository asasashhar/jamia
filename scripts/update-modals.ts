import * as fs from 'fs';
import * as path from 'path';

const adminDir = path.join(process.cwd(), 'src/app/(protected)/admin');

const pagesToUpdate = [
  { dir: 'students', addText: 'Add Student' },
  { dir: 'teachers', addText: 'Add Teacher' },
  { dir: 'classes', addText: 'Add Class' },
  { dir: 'subjects', addText: 'Add Subject' },
  { dir: 'fees', addText: 'Collect Fee' },
  { dir: 'results', addText: 'Upload Results', href: '/admin/results/new' },
  { dir: 'academic-years', addText: 'New Academic Year', btnText: 'New Academic Year' },
  { dir: 'users', addText: 'Add User' },
  { dir: 'documents', addText: 'Upload Document', href: '/admin/documents/upload', btnText: 'Upload Document' },
];

for (const page of pagesToUpdate) {
  const pagePath = path.join(adminDir, page.dir, 'page.tsx');
  if (!fs.existsSync(pagePath)) continue;

  let content = fs.readFileSync(pagePath, 'utf8');

  // Add import if not present
  if (!content.includes('AddItemModal')) {
    content = content.replace(
      'import { Plus,', 
      'import { AddItemModal } from "@/components/ui/AddItemModal";\nimport { Plus,'
    );
    // If it doesn't have Plus in the import, just add it below the shared import
    if (!content.includes('import { AddItemModal }')) {
      content = content.replace(
        'import { StatCard', 
        'import { AddItemModal } from "@/components/ui/AddItemModal";\nimport { StatCard'
      );
    }
  }

  const href = page.href || `/admin/${page.dir}/new`;
  const btnText = page.btnText || page.addText;
  
  // Replace the ActionBtn
  // <ActionBtn href="/admin/students/new"><Plus className="w-4 h-4" /> Add Student</ActionBtn>
  const actionBtnRegex = new RegExp(`<ActionBtn href="${href}"><Plus className="w-4 h-4" \\/> ${btnText}<\\/ActionBtn>`, 'g');
  
  content = content.replace(actionBtnRegex, `<AddItemModal title="${page.addText}" buttonText="${btnText}">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Please fill in the details below to add a new record.</p>
            {/* Form fields will go here */}
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button className="px-4 py-2 text-sm font-semibold border border-border rounded-xl">Cancel</button>
              <button className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl">Save</button>
            </div>
          </div>
        </AddItemModal>`);

  fs.writeFileSync(pagePath, content, 'utf8');
  console.log(`Updated ${pagePath}`);
}
