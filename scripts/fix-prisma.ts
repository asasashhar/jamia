import * as fs from 'fs';
import * as path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'app', '(protected)');

function findPageFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath));
    } else if (entry.name === 'page.tsx') {
      results.push(fullPath);
    }
  }
  return results;
}

const pages = findPageFiles(pagesDir);
let fixed = 0;

for (const file of pages) {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('new PrismaClient')) continue;
  
  // Replace: import { PrismaClient } from "@/generated/prisma";  +  const prisma = new PrismaClient();
  // With: import { prisma } from "@/lib/prisma";
  
  content = content.replace(
    /import \{ PrismaClient \} from ['"]@\/generated\/prisma['"];\s*\n/g,
    ''
  );
  content = content.replace(
    /const prisma = new PrismaClient\(\);\s*\n/g,
    ''
  );
  
  // Add the singleton import after the first line (after "use server" or at very top)
  if (!content.includes('@/lib/prisma')) {
    content = `import { prisma } from "@/lib/prisma";\n` + content;
  }
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Fixed: ${file.replace(process.cwd(), '')}`);
  fixed++;
}

console.log(`\nDone! Fixed ${fixed} files.`);
