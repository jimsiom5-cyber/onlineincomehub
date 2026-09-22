export default async () => {
  const origin = "http://89.168.31.30";
  try {
    const res = await fetch(origin + "/leaderboard.json?ts=" + Date.now(), {
      headers: { accept: "application/json" },
      cache: "no-store"
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Upstream status " + res.status }), {
        status: 502,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};