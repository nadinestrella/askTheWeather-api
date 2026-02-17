import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `Tell me the current weather in ${city}. Answer in one short sentence.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({
      text: text.replace(/\*\*/g, ''),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Server error',
    });
  }
}
