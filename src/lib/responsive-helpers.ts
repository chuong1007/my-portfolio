// Responsive data helpers for device-specific content editing
// Supports both legacy flat strings and new responsive objects

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ResponsiveValue = string | {
  desktop?: string | null;
  tablet?: string | null;
  mobile?: string | null;
} | null;

/**
 * Get value for a specific device with fallback chain:
 * mobile → tablet → desktop → fallback
 * 
 * Also handles legacy flat string format for backward compatibility.
 */
export function getResponsiveValue(
  field: ResponsiveValue,
  device: DeviceMode,
  fallback: string = ''
): string {
  // Legacy: flat string — same for all devices
  if (typeof field === 'string') return field;
  
  // Null/undefined
  if (!field || typeof field !== 'object') return fallback;

  // Fallback chain: requested device → larger device → desktop → fallback
  const chain: DeviceMode[] = 
    device === 'mobile'  ? ['mobile', 'tablet', 'desktop'] :
    device === 'tablet'  ? ['tablet', 'desktop'] :
                           ['desktop'];

  for (const d of chain) {
    const val = field[d];
    if (val !== null && val !== undefined && val !== '') return val;
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
  // Giải quyết giá trị hiển thị hiện tại cho TẤT CẢ thiết bị
  // Để đảm bảo khi ta thay đổi một thiết bị, các thiết bị khác giữ nguyên giao diện hiện tại của chúng
  // chứ không bị thụt lùi hay nhận giá trị thừa kế mới.
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
