export async function getLatestResetLink(mailhogUrl: string, toEmail: string): Promise<string | null> {
  const res = await fetch(`${mailhogUrl}/api/v2/messages`);
  if (!res.ok) throw new Error(`MailHog error ${res.status}`);
  const data: any = await res.json();

  const items: any[] = data?.items || [];
  const lowerTo = toEmail.toLowerCase();

  for (const msg of items) {
    const tos: string[] = (msg?.To || []).map((x: any) => (x?.Mailbox && x?.Domain ? `${x.Mailbox}@${x.Domain}` : '')).filter(Boolean);
    if (!tos.some(t => t.toLowerCase() === lowerTo)) continue;

    const body = msg?.Content?.Body || '';
    const m = body.match(/https?:\/\/[^\s"]+reset-password[^\s"]+/i) || body.match(/https?:\/\/[^\s"]+\/reset-password[^\s"]*/i);
    if (m?.[0]) return m[0];
  }

  return null;
}