import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { key, value } = req.body as { key: string; value: string };
  if (!key || !value) {
    res.status(400).json({ error: 'missing params' });
    return;
  }
  // In real scenario we would encrypt and store in env or KV
  process.env[key] = value;
  res.status(200).json({ ok: true });
}
