const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/layout.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add useSearchParams import
if (!content.includes('useSearchParams')) {
    content = content.replace(
        /import \{ usePathname, useRouter \} from "next\/navigation";/,
        'import { usePathname, useRouter, useSearchParams } from "next/navigation";'
    );
}

// Add searchParams hook
if (!content.includes('const searchParams = useSearchParams();')) {
    content = content.replace(
        /const pathname = usePathname\(\);/,
        'const pathname = usePathname();\n  const searchParams = useSearchParams();\n  const tab = searchParams.get("tab");'
    );
}

// Fix Links
content = content.replace(
    /<Link href="\/admin\/homepage" className={`(.*?) \${pathname === '\/admin\/homepage' \? (.*?) : (.*?)}`}>Trang chủ<\/Link>/g,
    '<Link href="/admin?tab=homepage" className={`$1 ${pathname === \'/admin\' && tab === \'homepage\' ? $2 : $3}`}>Trang chủ</Link>'
);

content = content.replace(
    /<Link href="\/admin\/analytics" className={`(.*?) \${pathname === '\/admin\/analytics' \? (.*?) : (.*?)}`}>Analytics<\/Link>/g,
    '<Link href="/admin?tab=analytics" className={`$1 ${pathname === \'/admin\' && tab === \'analytics\' ? $2 : $3}`}>Analytics</Link>'
);

content = content.replace(
    /<Link href="\/admin\/popup" className={`(.*?) \${pathname === '\/admin\/popup' \? (.*?) : (.*?)}`}>Popup<\/Link>/g,
    '<Link href="/admin?tab=popup" className={`$1 ${pathname === \'/admin\' && tab === \'popup\' ? $2 : $3}`}>Popup</Link>'
);

// Fix Dashboard active state (only if no tab param)
content = content.replace(
    /<Link href="\/admin" className={`(.*?) \${pathname === '\/admin' \? (.*?) : (.*?)}`}>Dashboard<\/Link>/g,
    '<Link href="/admin" className={`$1 ${pathname === \'/admin\' && !tab ? $2 : $3}`}>Dashboard</Link>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed layout links');
