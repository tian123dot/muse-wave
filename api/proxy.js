/**
 * Vercel Serverless Function
 * 代理 Deezer 搜索 API 和音频预览
 * 
 * 搜索: /api/proxy?q=关键词
 * 音频: /api/proxy?url=https://cdnt-preview.dzcdn.net/...
 */
module.exports = async (req, res) => {
  // CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { q, url } = req.query;

  // === 音频代理模式 ===
  if (url) {
    try {
      const response = await fetch(decodeURIComponent(url));
      if (!response.ok) {
        return res.status(response.status).end();
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
      const arrayBuffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
      return res.status(500).end();
    }
  }

  // === 搜索模式 ===
  if (!q) {
    return res.status(400).json({ error: 'Missing parameter "q" or "url"' });
  }

  const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=12`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Deezer API error' });
    }
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=60');

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
};
