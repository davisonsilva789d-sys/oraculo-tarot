const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/gemini", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Chave da Groq não configurada no Termux."
      });
    }

    const prompt = req.body.prompt;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "user",
              content: Array.isArray(prompt)
                ? JSON.stringify(prompt)
                : String(prompt || "")
            }
          ],
          temperature: 0.8
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Groq:", data);
      return res.status(response.status).json({
        error: data.error?.message || "Erro na API Groq."
      });
    }

    res.json({
      text: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao conectar com a Groq."
    });
  }
});

app.listen(3000, () => {
  console.log("Oráculo conectado à Groq!");
  console.log("Acesse: http://localhost:3000");
});