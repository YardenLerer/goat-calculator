import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use(express.static(__dirname));

// JSON body parser
app.use(express.json());

// שליחת הקובץ הראשי
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// נקודת גישה לרובוט
app.post('/analyze', async (req, res) => {
  const data = req.body;

  const prompt = `
אני רוצה שתתנהג כמומחה לשיווק דיגיטלי ופרסום ממומן. קיבלת את נתוני הקמפיין הבאים:
- תחום: ${data.industry}
- עלות ליד: ${data.cpl} ש"ח
- מספר לידים: ${data.clients}
- שווי לקוח: ${data.value} ש"ח
- מספר ימים: ${data.days}
- תקציב חודשי: ${data.monthlyBudget} ש"ח
- תקציב יומי: ${data.dailyBudget.toFixed(2)} ש"ח
- צפי הכנסה: ${data.estimatedRevenue} ש"ח
- ROAS משוער: ${data.roas.toFixed(2)}x

תן לי תובנות חכמות ואסטרטגיות ללקוח שמתלבט אם להשקיע בקמפיין כזה, כולל המלצות לשיפור, אזהרות אם צריך, ונקודות מפתח לחשיבה.

כתוב בעברית. אל תצטט את הנתונים עצמם אלא התייחס אליהם.
  `;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'אתה מומחה לקידום ממומן שנותן ניתוח חכם ללקוח' },
        { role: 'user', content: prompt }
      ]
    });

    const reply = gptResponse.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("GPT error:", error);
    res.status(500).json({ error: 'Failed to get GPT response' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
