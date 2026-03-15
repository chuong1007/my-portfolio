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
  field: ResponsiveValue,
  device: DeviceMode = 'desktop',
  fallback: string = ''
): string {
  // 1. Initial defensive checks
  if (field === null || field === undefined) return fallback;

  let value: any = field;

  // 2. Try to parse if it's a string that looks like JSON
  if (typeof field === 'string' && field.trim().startsWith('{')) {
    try {
      value = JSON.parse(field);
    } catch (e) {
      // If parsing fails, treat it as a literal string
      value = field;
    }
  }

  // 3. Handle primary types (String/Number)
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();

  // 4. Handle object (Responsive object)
  if (typeof value === 'object' && value !== null) {
    // If it's a responsive object, try to get requested device or fallback to desktop
    const deviceVal = value[device] ?? value['desktop'];
    
    if (deviceVal !== undefined && deviceVal !== null) {
      return deviceVal.toString();
    }
  }

  return fallback;
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
