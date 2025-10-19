export async function handler(event, context) {
  const API_URL = "http://89.168.31.30/leaderboard.json";
  try {
    const res = await fetch(API_URL);
    const data = await res.text();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch leaderboard", details: err.message })
    };
  }
}
