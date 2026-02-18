import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  //Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server misconfiguration: API key missing',
    });
  }

  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey!);

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      // generationConfig: { maxOutputTokens: 40, temperature: 0.7 },
    });

    const prompt = `Tell me the current weather in ${city}. Answer in one short sentence.`;

    // const result = await model.generateContent(prompt);
    console.time('Gemini call');
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    });
    console.timeEnd('Gemini call');

    const text = result.response.text();
    const cleanText = text?.replace(/\*\*/g, '') || 'No response generated';

    return res.status(200).json({ text: cleanText });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Server error',
    });
  }
}
