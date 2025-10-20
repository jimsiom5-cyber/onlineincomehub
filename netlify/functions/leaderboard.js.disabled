// netlify/functions/leaderboard.js
export const handler = async (event, context) => {
  const ORIGIN = process.env.LEADERBOARD_ORIGIN || 'http://89.168.31.30';
  const url = `${ORIGIN}/leaderboard.json?ts=${Date.now()}`;

  try {
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        },
        body: JSON.stringify({ error: `Upstream status ${res.status}`, body: text.slice(0, 200) })
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(e) })
    };
  }
};
