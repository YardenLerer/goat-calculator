import OpenAI from 'openai';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the root directory
app.use(express.static(__dirname));
app.use(express.json());

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle AI analysis requests
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
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'אתה מומחה לקידום ממומן שנותן ניתוח חכם ללקוח' },
        { role: 'user', content: prompt }
      ],
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('GPT Error:', error);
    res.status(500).json({ error: 'שגיאה בקבלת תגובה מהבינה המלאכותית' });
  }
});

app.listen(port, () => {
  console.log(`🔥 GOAT Calculator Server is running on port ${port}`);
});
