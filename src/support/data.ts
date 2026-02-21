export function randomEmail(prefix = 'qa'): string {
  const ts = Date.now();
  return `${prefix}.${ts}@example.com`;
}

export function strongPassword(): string {
  // cumple: 1 mayúscula + 1 número + 1 símbolo + 6-16 chars
  return 'Test1!aa';
}