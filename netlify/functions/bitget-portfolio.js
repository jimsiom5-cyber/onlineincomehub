import crypto from "node:crypto";

export async function handler(event, context) {
  try {
    const apiKey = process.env.BITGET_API_KEY;
    const secretKey = process.env.BITGET_API_SECRET;
    const passphrase = process.env.BITGET_PASSPHRASE;

    const timestamp = Date.now().toString();
    const baseUrl = "https://api.bitget.com";
    const endpoint = "/api/v2/account/assets";
    const method = "GET";

    const prehash = timestamp + method + endpoint;
    const sign = crypto.createHmac("sha256", secretKey).update(prehash).digest("base64");

    const headers = {
      "ACCESS-KEY": apiKey,
      "ACCESS-SIGN": sign,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
    };

    const resp = await fetch(baseUrl + endpoint, { headers });
    const json = await resp.json();

    if (!resp.ok || !json?.data) {
      return { statusCode: 500, body: JSON.stringify({ error: json?.msg || "Bitget fetch failed" }) };
    }

    const assets = json.data.map(a => ({
      coin: a.coin,
      available: parseFloat(a.available),
      frozen: parseFloat(a.frozen),
      usdValue: parseFloat(a.usdtValue),
    }));

    const totalValueUSD = assets.reduce((s, a) => s + (a.usdValue || 0), 0);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalValueUSD, assets: assets.filter(a => a.usdValue > 0.01) }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
