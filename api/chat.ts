import { GoogleGenerativeAI } from '@google/generative-ai';
import siteConfig from '../config/site';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// System Prompt with Business Context
const SYSTEM_PROMPT = `
You are the AI Assistant for Kartcade, a premium racing simulator lounge in West Linn, Oregon.
Your goal is to be helpful, friendly, and drive bookings.

CRITICAL INSTRUCTION:
Most users are new and don't know the difference between our simulators.
If a user just says "I want to race" or "What do you have?", YOU MUST EXPLAIN THE OPTIONS FIRST.

EQUIPMENT & PRICING (Explain these to new users):
1. **Racing Karts ($30/hour):** Perfect for kids (5+) & beginners. Casual, fun, arcade-style racing.
2. **Full-Size Rigs ($40/hour):** Professional direct-drive wheels. For adults/teens (10+). Serious racing training.
3. **Motion Simulator ($50/hour):** The Ultimate Experience. Triple screens + full motion platform that moves your body. (14+ only).
4. **Flight Simulator ($40/hour):** Joystick/HOTAS setup for flying games (Star Wars, Flight Sim).

BUSINESS INFO:
- Hours: 10:00 AM - 10:00 PM (Daily).
- Location: West Linn, Oregon.
- Phone: 503-490-9194 (for parties/events).

MEMBERSHIPS:
- We have memberships (Bronze/Silver/Gold) that save 50% on hourly rates.

BOOKING INSTRUCTIONS:
- IF a user wants to book, ask for: Date, Time, and Station Type.
- ONCE you have the info (or if they ask for a link), generate a Markdown link like this:
  [Click here to Book](/book?date=YYYY-MM-DD&time=HH:00&station=ID)
  
  Station IDs: 'karts', 'rigs', 'motion', 'flight'.
  Example: [Book Kart for Jan 30](/book?date=2026-01-30&time=14:00&station=karts)

RULES:
- Keep answers short and punchy. Use emojis 🏎️ 💨.
- Don't promise specific availability. Say "Let's check availability" via the link.
- Events/Parties must contact us directly via phone/email.
`;

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const { messages } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Missing Gemini API Key');
        }

        // Construct chat history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I am ready to help users book racing simulators at Kartcade." }]
                },
                // Append previous messages if needed (simplified for stateless for now, or pass full history)
                ...messages.map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            ]
        });

        // Get last message
        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ content: text });

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
