import {
  isValidProfileName,
  normalizeProfileName,
  PROFILE_NAME_MAX_LENGTH,
} from '../profile-presentation';

describe('profile presentation', () => {
  it('normalizes whitespace before persisting a local display name', () => {
    expect(normalizeProfileName('  Garden   Wanderer  ')).toBe('Garden Wanderer');
  });

  it('rejects blank and overlong names', () => {
    expect(isValidProfileName('   ')).toBe(false);
    expect(isValidProfileName('a'.repeat(PROFILE_NAME_MAX_LENGTH + 1))).toBe(false);
    expect(isValidProfileName('Quiet Mind')).toBe(true);
  });
});
