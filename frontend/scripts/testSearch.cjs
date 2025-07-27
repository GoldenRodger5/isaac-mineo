#!/usr/bin/env node
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const query = process.argv[2];

if (!query) {
    console.log('Usage: node testSearch.cjs "<search query>"');
    console.log('Example: node testSearch.cjs "What programming languages does Isaac know?"');
    process.exit(1);
}

async function testSearch() {
    console.log(`🔍 Searching for: "${query}"\n`);
    
    try {
        // Generate embedding for the query
        console.log('🧠 Generating query embedding...');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query
        });
        
        const queryEmbedding = response.data[0].embedding;
        console.log('   ✅ Query embedding generated');
        
        // Search Pinecone
        console.log('📤 Searching Pinecone index...');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const searchResults = await index.query({
            vector: queryEmbedding,
            topK: 5,
            includeMetadata: true
        });
        
        console.log(`   ✅ Found ${searchResults.matches.length} matches\n`);
        
        // Display results
        console.log('📋 Search Results:');
        searchResults.matches.forEach((match, i) => {
            console.log(`\n${i + 1}. Score: ${match.score.toFixed(4)} | Source: ${match.metadata.source}`);
            console.log(`   Text: ${match.metadata.text.substring(0, 200)}${match.metadata.text.length > 200 ? '...' : ''}`);
        });
        
    } catch (error) {
        console.error('\n❌ Search failed:', error.message);
        process.exit(1);
    }
}

testSearch();
