$files = Get-ChildItem -Recurse -Filter "page.tsx" "c:\Users\STUDENT\Downloads\jamia\src\app\(protected)"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "new PrismaClient") {
        # Replace import
        $content = $content -replace "import \{ PrismaClient \} from '@/generated/prisma';", "import { prisma } from '@/lib/prisma';"
        $content = $content -replace 'import \{ PrismaClient \} from "@/generated/prisma";', 'import { prisma } from "@/lib/prisma";'
        # Remove the instantiation line
        $content = $content -replace "const prisma = new PrismaClient\(\);`r`n", ""
        $content = $content -replace "const prisma = new PrismaClient\(\);`n", ""
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}
Write-Host "Done!"
