// pages/api/gist.ts
import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!GITHUB_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gist');
      }

      const data = await response.json();
      const content = data.files['config.json']?.content || '{}';
      return res.status(200).json(JSON.parse(content));
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  }

  if (req.method === 'POST') {
    try {
      const config = req.body;

      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'config.json': {
              content: JSON.stringify(config, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update gist');
      }

      return res.status(200).json({ message: 'Configuration saved successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
