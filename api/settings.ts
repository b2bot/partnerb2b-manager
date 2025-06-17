import { VercelRequest, VercelResponse } from '@vercel/node';

const db: Record<string, unknown> = globalThis.__settings || (globalThis.__settings = {});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = (req.query.client as string) || 'default';

  if (req.method === 'GET') {
    res.status(200).json(db[clientId] || {});
    return;
  }

  if (req.method === 'POST') {
    db[clientId] = req.body;
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
