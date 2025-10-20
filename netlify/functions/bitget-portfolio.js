const crypto = require("crypto");
const https = require("https");

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "GET", headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const body = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, body });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

exports.handler = async () => {
  try {
    const apiKey = process.env.BITGET_API_KEY;
    const secretKey = process.env.BITGET_API_SECRET;
    const passphrase = process.env.BITGET_PASSPHRASE;

    const endpoint = "/api/v2/account/assets";
    const timestamp = Date.now().toString();
    const prehash = timestamp + "GET" + endpoint;
    const sign = crypto.createHmac("sha256", secretKey).update(prehash).digest("base64");

    const headers = {
      "ACCESS-KEY": apiKey,
      "ACCESS-SIGN": sign,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
    };

    const { statusCode, body } = await httpGet("https://api.bitget.com" + endpoint, headers);

    if (statusCode !== 200 || !body?.data) {
      return { statusCode: 500, body: JSON.stringify({ error: body?.msg || "Bitget fetch failed" }) };
    }

    const assets = body.data
      .map((a) => ({
        coin: a.coin,
        available: parseFloat(a.available),
        frozen: parseFloat(a.frozen),
        usdValue: parseFloat(a.usdtValue),
      }))
      .filter((a) => a.usdValue > 0.01);

    const totalValueUSD = assets.reduce((s, a) => s + (a.usdValue || 0), 0);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalValueUSD, assets }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
