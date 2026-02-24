export function randomEmail(prefix = 'qa'): string {
  const ts = Date.now();
  return `${prefix}.${ts}@example.com`;
}

export function strongPassword(): string {  return 'Test1!aa';
}