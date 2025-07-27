#!/usr/bin/env node
const { OpenAI } = require('openai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

async function testGPT4o() {
    console.log('🤖 Testing GPT-4o chatbot integration...\n');
    
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Test the exact structure used in the chatbot
        const knowledgeBase = `=== FROM ABOUT_ME.TXT ===
Isaac Mineo - Personal Information

Full Name: Isaac Mineo
Location: Available for remote work and relocation
Email: isaac@isaacmineo.com
GitHub: https://github.com/GoldenRodger5

=== FROM TECH_STACK.TXT ===
Isaac Mineo - Technical Skills & Stack

FRONTEND DEVELOPMENT:
- React 18 (Expert level) - Hooks, Context, state management
- JavaScript/TypeScript (Advanced) - ES6+, async programming
- Tailwind CSS (Advanced) - Responsive design, custom components

BACKEND DEVELOPMENT:
- FastAPI (Expert) - High-performance Python framework
- Node.js (Proficient) - Server-side JavaScript, API development
- RESTful API Design (Advanced) - Clean architecture, documentation`;

        const userPrompt = `KNOWLEDGE BASE INFORMATION ABOUT ISAAC MINEO:
${knowledgeBase}

RECENT CONVERSATION CONTEXT:


USER QUESTION: What programming languages and frameworks does Isaac specialize in?

Please provide a helpful, professional, and engaging response about Isaac based on the knowledge base information above. Follow these guidelines:
1. Be conversational yet professional and enthusiastic about Isaac's capabilities
2. Use specific details from the knowledge base to support your answers
3. Connect Isaac's experience, skills, and projects to show his growth and expertise
4. If asked about something not in the knowledge base, clearly state that limitation
5. For contact inquiries, provide isaac@isaacmineo.com
6. Keep responses informative but digestible (2-4 sentences initially, offer to elaborate)
7. Reference specific technologies, projects, or experiences when relevant`;

        console.log('📝 Testing chatbot response...');
        
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: "You are Isaac Mineo's AI assistant. Provide helpful, professional, and engaging responses about Isaac based on the comprehensive knowledge base information provided in the user message." 
                },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 600,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });
        
        console.log('✅ GPT-4o Response:');
        console.log(response.choices[0].message.content);
        console.log(`\n📊 Usage: ${response.usage.total_tokens} tokens (${response.usage.prompt_tokens} prompt + ${response.usage.completion_tokens} completion)`);
        
    } catch (error) {
        console.error('❌ GPT-4o test failed:', error.message);
        if (error.response) {
            console.error('Response details:', error.response.data);
        }
    }
}

testGPT4o();
