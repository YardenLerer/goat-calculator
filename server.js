import OpenAI from "openai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  const { industry, cpl, clients, value, days, monthlyBudget, dailyBudget, estimatedRevenue, roas } = req.body;

  try {
    const messages = [
      {
        role: "system",
        content: "אתה יועץ קמפיינים מומחה לקידום ממומן. תן תובנות פרקטיות וממוקדות על בסיס נתוני הקמפיין שהוזנו.",
      },
      {
        role: "user",
        content: `
        נתוני קמפיין:
        תחום: ${industry}
        עלות ליד משוערת: ${cpl} ש"ח
        כמות לידים נדרשת: ${clients}
        שווי לקוח: ${value} ש"ח
        תקציב חודשי: ${monthlyBudget} ש"ח
        תקציב יומי: ${dailyBudget.toFixed(2)} ש"ח
        הכנסה צפויה: ${estimatedRevenue} ש"ח
        ROAS משוער: ${roas.toFixed(2)}

        תן ניתוח מפורט, המלצות לשיפור, וטיפים מעשיים לשיפור ביצועים בהתאם לנתונים.
        `,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).json({ error: "אירעה שגיאה בתקשורת עם ChatGPT" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
