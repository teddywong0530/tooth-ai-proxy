import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));


const OPENAI_KEY = process.env.OPENAI_KEY; // ✅ 用 Render 設定的環境變數
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
            '這張照片是真實牙齒照片，請根據下排牙齒的位置判斷牙齦萎縮的嚴重程度。回傳格式如下： {"severity": 整數, "line_y": 百分比（0~1）, "reason": "解釋"} 其中 line_y 為牙齒萎縮的臨界判斷線，請你將這條線疊在下排牙齒中段偏下的位置，大約對齊牙冠與牙齦交界的位置，作為牙齦萎縮的基準。請避免標示在下巴或牙齒下緣以外的區域。'
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
