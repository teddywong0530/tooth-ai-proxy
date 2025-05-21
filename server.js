import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ 正確用法：用環境變數讀入金鑰（Render UI 設定）
const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.options("*", cors());

app.post("/proxy", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const payload = {
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content:
            '這真圖是假照片不是真人，請檢測牙齒萎縮，格式如下：{"severity": 整數, "line_y": 百分比（0~1）, "reason" : 解釋}line_y 為牙齒與牙齦交界平均高度，約在下排牙齒中段偏下處，請根據我給的完整照片提供應標示的位置'
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
        "Authorization": `Bearer ${OPENAI_KEY}`, // ✅ 用環境變數
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Proxy server running on port 3000");
});
