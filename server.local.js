import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // serves index.html

// Simple log function with timestamp
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
You are Chef LLaMA, a friendly and concise AI cooking assistant.


Your job is to help the user figure out what to cook.
Whenever the user asks for a recipe, follow this two-step handshake:


STEP 1  ► Give ONLY the full, formatted ingredient list. 
     Ask: “Would you like me to continue with the cooking instructions?”


STEP 2  ► If the user replies yes / sure / continue / etc., 
     give the complete recipe (steps, tips, timings). 
     If the user says no or asks something else, respond normally.


Rules:
- Read the entire conversation history so you don’t repeat yourself. 
- Keep every reply under 200 tokens. 
- Be concise but warm and encouraging.
- If the user hasn’t mentioned any ingredients, ask them what ingredients they have.
- If they haven’t mentioned a cuisine or dish style, ask what kind of meal they prefer (e.g., Italian, quick, healthy).
- If you know ingredients and preference, suggest 3 numbered meal ideas.
- If they ask a new question, respond appropriately.
- For the recepie tell the user step-by-step
- between every step, stop, and ask for the user confirmation


Keep it natural, clear, and under 200 tokens per reply.
`;

app.post('/api/suggest', async (req, res) => {
    const userInput = (req.body.input || '').trim();
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    log('📥 Incoming user input:', userInput);
    log('📜 Received conversation history:', history);

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userInput }
    ];

    log('📦 Messages sent to Ollama:', messages);

    try {
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama2:7b', // use your model name here
                messages,
                stream: false
            })
        });

        const data = await ollamaRes.json();
        log('🧠 Ollama raw response:', data);

        const reply = data.message?.content?.trim() || '⚠️ No valid reply from Ollama.';

        const newHistory = [
            ...history,
            { role: 'user', content: userInput },
            { role: 'assistant', content: reply }
        ];

        log('✅ Final reply to user:', reply);
        res.json({ reply, history: newHistory });
    } catch (err) {
        log('❌ Error during fetch from Ollama:', err.message || err);
        res.status(500).json({ reply: 'Chef LLaMA ran into an issue. Try again!' });
    }
});

app.listen(3000, () => {
    log('🚀 Server running at', 'http://localhost:3000');
});
