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
    // Do NOT try to JSON.parse it to avoid 'Unexpected token o' crashes.
    if (typeof field === 'string') {
      return field;
    }

    if (typeof field === 'number' || typeof field === 'boolean') {
      return String(field);
    }

    // Handle object forms
    if (typeof field === 'object') {
      const val = field[device] ?? field['desktop'] ?? field['tablet'] ?? field['mobile'];
      if (val !== undefined && val !== null) {
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
      // If we can't find a responsive key, stringify the whole object so it doesn't crash React
      return JSON.stringify(field);
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
