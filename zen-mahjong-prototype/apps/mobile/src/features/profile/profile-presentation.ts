export const PROFILE_NAME_MAX_LENGTH = 28;

export function normalizeProfileName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidProfileName(value: string): boolean {
  const normalized = normalizeProfileName(value);
  return normalized.length > 0 && normalized.length <= PROFILE_NAME_MAX_LENGTH;
}
