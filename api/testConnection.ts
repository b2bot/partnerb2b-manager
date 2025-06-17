import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { platform } = req.query;
  // Fake success response
  res.status(200).json({ platform, ok: true });
}
