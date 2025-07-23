import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
console.log("✅ TOGETHER_API_KEY:", process.env.TOGETHER_API_KEY);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

const log = (label, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${label}`);
    if (data !== undefined) {
        if (typeof data === 'object') {
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(data);
        }
    }
};

const systemPrompt = `
You are Chef LLaMA, a warm, friendly, and concise AI cooking assistant.
Keep every reply under **100 tokens** — be short, helpful, and friendly.

Your job is to help the user figure out what to cook, in a clear, welcoming, and step-by-step way.


Ask **only one question at a time**:
1. First, ask: “What ingredients do you have?”
2. Once they respond, ask: “What kind of meal are you in the mood for?” (e.g., Italian, healthy, quick, spicy)
3. Then, suggest 3 numbered meal ideas based on their answers.
4. If they ask for a recipe, follow this two-step handshake **strictly**:

---
STEP 1 ► Provide **ONLY** the full, formatted ingredient list.  
        End **exactly** with: “Would you like me to continue with the cooking instructions?”  
        Do not add any additional questions, comments, or suggestions.

STEP 2 ► If the user replies yes / sure / continue / etc.,  
        give the full recipe step-by-step.  
        Pause after each step and ask: “Ready for the next step?”

---
Other Rules:
- Read the full conversation history so you don’t repeat yourself.
- Be warm, clear, and concise.
- Keep every reply under 200 tokens.
- If the user says something unrelated, respond appropriately and guide them back.
- Never skip ahead or assume — always wait for their answer before proceeding.
- Strictly follow the two-step handshake format for recipes.

Tone: friendly, conversational, helpful — like a calm chef in your kitchen.

Begin by greeting the user and asking what ingredients they have.
`;

app.post('/api/suggest', async (req, res) => {
    const userInput = (req.body.input || '').trim();
    const rawHistory = Array.isArray(req.body.history) ? req.body.history : [];

    const cleanedHistory = [];
    for (let i = 0; i < rawHistory.length; i++) {
        const msg = rawHistory[i];
        const last = cleanedHistory[cleanedHistory.length - 1];
        if (msg && typeof msg.role === 'string' && typeof msg.content === 'string' &&
            ['user', 'assistant'].includes(msg.role) &&
            (!last || msg.content.trim() !== last.content.trim() || msg.role !== last.role)) {
            cleanedHistory.push({ role: msg.role, content: msg.content.trim() });
        }
    }

    const lastMessage = cleanedHistory[cleanedHistory.length - 1];
    let interpretedInput = userInput;
    if (userInput.toLowerCase().includes('first option')) {
        interpretedInput = '1';
    } else if (userInput.toLowerCase().includes('let\'s make it') || userInput.toLowerCase().includes('great')) {
        interpretedInput = 'yes';
    } else if (userInput.toLowerCase().includes('what else') || userInput.toLowerCase().includes('whaty else')) {
        interpretedInput = 'Please provide the full ingredient list and ask if I’d like instructions.';
    }

    const messages = [
        { role: 'system', content: systemPrompt },
        ...cleanedHistory.slice(-3)
    ];

    if (messages.length < 2) {
        messages.push({ role: 'user', content: interpretedInput });
    }

    log('📥 Incoming user input:', userInput);
    log('📦 Full messages array:', messages);

    try {
        const payload = {
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            messages: messages,
            temperature: 0.3, // Reduced to ensure stricter adherence to prompt
            max_tokens: 300,
            stream: false
        };
        log('📤 API Payload:', payload);

        const togetherRes = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await togetherRes.json();
        log('🧠 TogetherAI raw response:', data);

        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error(data?.error?.message || 'Empty reply');

        const newHistory = [...cleanedHistory, { role: 'assistant', content: reply }];

        res.json({ reply, history: newHistory });
    } catch (err) {
        log('❌ Error during fetch from TogetherAI:', err.message || err);
        res.status(500).json({ reply: 'Chef LLaMA ran into an issue with TogetherAI. Try again!' });
    }
});

app.listen(3000, () => {
    log('🚀 Server running at', 'http://localhost:3000 (TogetherAI)');
});