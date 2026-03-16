// Responsive data helpers for device-specific content editing
// Supports both legacy flat strings and new responsive objects

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ResponsiveValue = string | {
  desktop?: string | null;
  tablet?: string | null;
  mobile?: string | null;
} | null;

/**
 * Safely parses and retrieves a responsive value for a given device.
 * If the value is a string or number, it's treated as the 'desktop' (default) value.
 * If it's a JSON string, it's parsed first.
 */
export function getResponsiveValue(
  field: any,
  device: DeviceMode = 'desktop',
  fallback: string = ''
): string {
  try {
    if (field === null || field === undefined) return String(fallback);

    // If data in DB is already a string (legacy format or plain text), use it directly.
    if (typeof field === 'string') {
      return field;
    }

    if (typeof field === 'number' || typeof field === 'boolean') {
      return String(field);
    }

    // Handle object forms
    if (typeof field === 'object') {
      // Special case for RichTextData: { content, fontSize }
      // If we are asking for a value from a RichTextData and it hasn't been upgraded to responsive content yet
      if ('content' in field && typeof field.content === 'string') {
        return field.content;
      }

      // If content is responsive: { content: { mobile, ... }, fontSize }
      if ('content' in field && typeof field.content === 'object' && field.content !== null) {
        const c = field.content[device] ?? field.content['desktop'] ?? field.content['tablet'] ?? field.content['mobile'];
        return c !== undefined && c !== null ? String(c) : '';
      }

      // Standard responsive object: { desktop, tablet, mobile }
      const val = field[device] ?? field['desktop'] ?? field['tablet'] ?? field['mobile'];
      if (val !== undefined && val !== null) {
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
      
      // If we can't find anything, but it's an object we don't recognize
      return '';
    }

    return String(fallback);
  } catch (err) {
    console.error('getResponsiveValue error:', err);
    return String(fallback);
  }
}

/**
 * Set value for a specific device, preserving other device values.
 * Converts legacy flat string to responsive object on first edit.
 */
export function setResponsiveValue(
  current: ResponsiveValue,
  device: DeviceMode,
  value: string
): Record<DeviceMode, string | null> {
  // Resolve current values for all devices to preserve existing look
  const resolvedDesktop = getResponsiveValue(current, 'desktop', '');
  const resolvedTablet = getResponsiveValue(current, 'tablet', '');
  const resolvedMobile = getResponsiveValue(current, 'mobile', '');

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
