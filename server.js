import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors()); // 加這行即可支援全部 origin
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.options("*", cors()); // 明確支援所有 OPTIONS 預檢請求

app.post("/proxy", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: '這是真圖但不是真人，請檢測牙齒萎縮，格式如下：{"severity": 整數, "line_y": 百分比（0~1）, "reason": 原因說明}。line_y 為牙齒與牙齦交界平均高度。'
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*"); // 落實加 Header
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Proxy server running on port 3000");
});
