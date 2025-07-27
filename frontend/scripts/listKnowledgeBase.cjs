#!/usr/bin/env node
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

async function listKnowledgeBase() {
    console.log('📚 Knowledge Base Contents\n');
    
    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        
        // Get index stats
        const stats = await index.describeIndexStats();
        console.log('📊 Index Statistics:');
        console.log(`   Total vectors: ${stats.totalVectorCount}`);
        console.log(`   Dimension: ${stats.dimension}\n`);
        
        // Query for all unique sources
        console.log('📋 Files in Knowledge Base:');
        
        // We need to query with different filters to find all sources
        // This is a workaround since Pinecone doesn't have a direct way to list all metadata
        const commonSources = [
            'about_me.txt',
            'tech_stack.txt', 
            'projects.txt',
            'career_goals.txt',
            'Mineo, Isaac, Resume.pdf',
            'Mineo, Isaac, Transcript.pdf'
        ];
        
        let totalVectors = 0;
        
        for (const source of commonSources) {
            try {
                const result = await index.query({
                    vector: new Array(1536).fill(0), // dummy vector
                    filter: { source: source },
                    topK: 1000,
                    includeMetadata: false
                });
                
                if (result.matches && result.matches.length > 0) {
                    console.log(`   ✅ ${source} - ${result.matches.length} chunks`);
                    totalVectors += result.matches.length;
                }
            } catch (error) {
                // File doesn't exist in knowledge base
            }
        }
        
        console.log(`\n📈 Summary: ${totalVectors} total vectors across ${commonSources.filter(async source => {
            try {
                const result = await index.query({
                    vector: new Array(1536).fill(0),
                    filter: { source: source },
                    topK: 1,
                    includeMetadata: false
                });
                return result.matches && result.matches.length > 0;
            } catch {
                return false;
            }
        }).length} files`);
        
        console.log('\n💡 To add a new file:');
        console.log('   node scripts/addToKnowledgeBase.cjs "path/to/your/file.txt"');
        console.log('\n🔍 To search the knowledge base:');
        console.log('   node scripts/testSearch.cjs "your search query"');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listKnowledgeBase();
