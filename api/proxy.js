/**
 * Vercel Serverless Function
 * 代理 Deezer 搜索 API，解决浏览器的跨域限制
 * 
 * 部署后可通过 /api/proxy?q=关键词 调用
 */
module.exports = async (req, res) => {
  // CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=12`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Deezer API error' });
    }
    const data = await response.json();

    // 允许前端跨域调用
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // 缓存 60 秒，避免重复请求
    res.setHeader('Cache-Control', 'public, max-age=60');

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
};
