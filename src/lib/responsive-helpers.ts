// Responsive data helpers for device-specific content editing
// Supports both legacy flat strings and new responsive objects

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ResponsiveValue = string | boolean | number | {
  desktop?: any;
  tablet?: any;
  mobile?: any;
} | null;

/**
 * Safely parses and retrieves a responsive value for a given device.
 * If the value is a string or number, it's treated as the 'desktop' (default) value.
 * If it's a JSON string, it's parsed first.
 */
export function getResponsiveValue<T = any>(
  field: any,
  device: DeviceMode = 'desktop',
  fallback: T = '' as any
): T {
  try {
    if (field === null || field === undefined) return fallback;

    // If data in DB is already a string/number/boolean (legacy format), use it directly.
    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
      return field as T;
    }

    // Handle object forms
    if (typeof field === 'object') {
      // Special case for RichTextData: { content, fontSize }
      if ('content' in field && field.content !== null) {
         if (typeof field.content === 'object' && ('desktop' in field.content || 'tablet' in field.content || 'mobile' in field.content)) {
            const raw = field.content[device] ?? field.content['desktop'] ?? field.content['tablet'] ?? field.content['mobile'];
            return (raw !== undefined ? raw : fallback) as T;
         }
         return field.content as T;
      }

      // Standard responsive object: { desktop, tablet, mobile }
      const val = field[device] ?? field['desktop'] ?? field['tablet'] ?? field['mobile'];
      if (val !== undefined && val !== null) {
        return val as T;
      }
      
      return fallback;
    }

    return fallback;
  } catch (err) {
    console.error('getResponsiveValue error:', err);
    return fallback;
  }
}

/**
 * Set value for a specific device, preserving other device values.
 * Converts legacy flat string to responsive object on first edit.
 */
export function setResponsiveValue<T = any>(
  current: any,
  device: DeviceMode,
  value: T
): Record<DeviceMode, T | null> {
  const resolvedDesktop = getResponsiveValue<T>(current, 'desktop', value);
  const resolvedTablet = getResponsiveValue<T>(current, 'tablet', value);
  const resolvedMobile = getResponsiveValue<T>(current, 'mobile', value);

  return {
    desktop: device === 'desktop' ? value : resolvedDesktop,
    tablet: device === 'tablet' ? value : resolvedTablet,
    mobile: device === 'mobile' ? value : resolvedMobile,
  };
}

/**
 * Check if a field uses the responsive object format (vs legacy string).
 */
export function isResponsiveObject(field: ResponsiveValue): field is Record<string, string | null> {
  return field !== null && typeof field === 'object' && ('desktop' in field || 'tablet' in field || 'mobile' in field);
}
