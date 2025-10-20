import crypto from "crypto";
import fetch from "node-fetch";

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

    const response = await fetch(baseUrl + endpoint, { headers });
    const json = await response.json();

    if (!response.ok || !json.data) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: json.msg || "Failed to fetch Bitget portfolio" }),
      };
    }

    const portfolio = json.data.map((asset) => ({
      coin: asset.coin,
      available: parseFloat(asset.available),
      frozen: parseFloat(asset.frozen),
      usdValue: parseFloat(asset.usdtValue),
    }));

    const totalValue = portfolio.reduce((sum, a) => sum + (a.usdValue || 0), 0);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalValueUSD: totalValue,
        assets: portfolio.filter(a => a.usdValue > 0.01),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

