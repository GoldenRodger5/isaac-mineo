#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🤖 Testing AI Chatbot Functionality\n');

async function testChatbot() {
    try {
        // Initialize APIs
        const { OpenAI } = await import('openai');
        const { Pinecone } = await import('@pinecone-database/pinecone');
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const index = pinecone.index('isaac-portfolio');
        
        console.log('✅ APIs initialized successfully');
        
        // Test queries
        const testQueries = [
            "What programming languages does Isaac know?",
            "Tell me about Isaac's education",
            "What projects has Isaac worked on?",
            "What are Isaac's career goals?",
            "What frameworks and tools does Isaac use?"
        ];
        
        for (const query of testQueries) {
            console.log(`\n🔍 Query: "${query}"`);
            
            // Get embeddings for the query
            const queryEmbedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: query,
            });
            
            // Search Pinecone
            const searchResults = await index.query({
                vector: queryEmbedding.data[0].embedding,
                topK: 3,
                includeMetadata: true
            });
            
            if (searchResults.matches.length === 0) {
                console.log('   ❌ No relevant documents found');
                continue;
            }
            
            // Prepare context from search results
            const context = searchResults.matches
                .map(match => match.metadata.text)
                .join('\n\n');
            
            console.log(`   📄 Found ${searchResults.matches.length} relevant chunks:`);
            searchResults.matches.forEach((match, i) => {
                console.log(`      ${i + 1}. ${match.metadata.document_title} (score: ${match.score.toFixed(3)})`);
            });
            
            // Generate AI response
            const messages = [
                {
                    role: 'system',
                    content: `You are Isaac Mineo's AI assistant. Answer questions about Isaac based on the provided context. Be helpful, accurate, and friendly. If the context doesn't contain enough information, say so.

Context from Isaac's documents:
${context}`
                },
                {
                    role: 'user',
                    content: query
                }
            ];
            
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                max_tokens: 200,
                temperature: 0.7
            });
            
            const response = completion.choices[0].message.content;
            console.log(`   🤖 AI Response: ${response}`);
            
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('\n✅ Chatbot testing complete!');
        
    } catch (error) {
        console.error('❌ Chatbot test failed:', error.message);
        if (error.message.includes('No vectors found in index')) {
            console.log('\n💡 Tip: Run setupVectorization.js first to index documents');
        }
    }
}

await testChatbot();
