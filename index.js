import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const app = express();
const apiKey = "9720547f8c2f4629a04e7522c2d49f03";
const secret = "85ef05d6669c460fa73154a479de4a39";
const passphrase = "ZaidArslan";

app.get("/", async (req, res) => {
  const method = "GET";
  const requestPath = "/api/futures/v3/orders?status=1&limit=10";
  const timestamp = Date.now() / 1000;

  const prehash = timestamp + method.toUpperCase() + requestPath;
  const signature = crypto.createHmac("sha256", secret)
    .update(prehash)
    .digest("base64");

  try {
    const response = await fetch("https://www.blofin.com" + requestPath, {
      method,
      headers: {
        "ACCESS-KEY": apiKey,
        "ACCESS-SIGN": signature,
        "ACCESS-TIMESTAMP": timestamp.toString(),
        "ACCESS-PASSPHRASE": passphrase
      }
    });

    const contentType = response.headers.get("content-type");
    const rawText = await response.text(); // ambil mentah dulu

    if (contentType && contentType.includes("application/json")) {
      const json = JSON.parse(rawText);
      res.json(json);
    } else {
      res.status(500).send({
        error: "Expected JSON but received something else",
        contentType,
        raw: rawText
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
