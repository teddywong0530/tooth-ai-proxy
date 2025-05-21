const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/proxy", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const body = {
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

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await openaiRes.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Proxy running on port 3000");
});
