const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/responsive-helpers.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newGetResponsiveValue = `export function getResponsiveValue<T = any>(
  field: any,
  device: DeviceMode = 'desktop',
  fallback: T = '' as any
): T {
  try {
    if (field === null || field === undefined) return fallback;

    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
      return field as T;
    }

    if (typeof field === 'object') {
      if ('content' in field && field.content !== null) {
         if (typeof field.content === 'object' && ('desktop' in field.content || 'tablet' in field.content || 'mobile' in field.content)) {
            let raw = field.content[device] ?? field.content['desktop'] ?? field.content['tablet'] ?? field.content['mobile'];
            if (typeof raw === 'object' && raw !== null && 'content' in raw) raw = raw.content;
            return (raw !== undefined ? raw : fallback) as T;
         }
         let raw = field.content;
         if (typeof raw === 'object' && raw !== null && 'content' in raw) raw = raw.content;
         return raw as T;
      }

      let val = field[device] ?? field['desktop'] ?? field['tablet'] ?? field['mobile'];
      
      // Handle nested object from accidental nested setResponsiveValue
      if (typeof val === 'object' && val !== null) {
        if ('content' in val) val = val.content;
        else if ('desktop' in val) val = val[device] ?? val['desktop'];
      }
      
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
           return String(val) as T;
        }
        return val as T;
      }
      
      return fallback;
    }

    return fallback;
  } catch (err) {
    console.error('getResponsiveValue error:', err);
    return fallback;
  }
}`;

content = content.replace(/export function getResponsiveValue<T = any>\([\s\S]*?return fallback;\n  \} catch \(err\) \{\n    console\.error\('getResponsiveValue error:', err\);\n    return fallback;\n  \}\n\}/, newGetResponsiveValue);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed responsive helpers nested objects');
