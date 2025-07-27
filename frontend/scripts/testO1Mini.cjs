#!/usr/bin/env node
const { OpenAI } = require('openai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

async function testO1Mini() {
    console.log('🧠 Testing o1-mini reasoning model...\n');
    
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        console.log('📝 Testing with a simple question...');
        
        const response = await openai.chat.completions.create({
            model: "o1-mini",
            messages: [
                { 
                    role: "user", 
                    content: "You are Isaac Mineo's AI assistant. Based on this information about Isaac: 'Isaac is a Full-Stack Developer specializing in React, Python, and AI integrations. He built Nutrivize, an AI-powered nutrition tracker.' Please answer: What is Isaac's main project?"
                }
            ]
        });
        
        console.log('✅ o1-mini response:');
        console.log(response.choices[0].message.content);
        console.log(`\n📊 Usage: ${response.usage.total_tokens} tokens`);
        
    } catch (error) {
        console.error('❌ o1-mini test failed:', error.message);
        
        // Test fallback to GPT-4o
        console.log('\n🔄 Testing fallback to GPT-4o...');
        try {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            
            const fallbackResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: "You are Isaac Mineo's AI assistant."
                    },
                    {
                        role: "user",
                        content: "Based on this information about Isaac: 'Isaac is a Full-Stack Developer specializing in React, Python, and AI integrations. He built Nutrivize, an AI-powered nutrition tracker.' Please answer: What is Isaac's main project?"
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });
            
            console.log('✅ GPT-4o fallback response:');
            console.log(fallbackResponse.choices[0].message.content);
            console.log(`\n📊 Usage: ${fallbackResponse.usage.total_tokens} tokens`);
            
        } catch (fallbackError) {
            console.error('❌ GPT-4o fallback also failed:', fallbackError.message);
        }
    }
}

testO1Mini();
