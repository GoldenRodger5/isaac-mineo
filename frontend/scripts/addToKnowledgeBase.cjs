#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const filePath = process.argv[2];

if (!filePath) {
    console.log('Usage: node addToKnowledgeBase.cjs <path-to-file>');
    console.log('Examples:');
    console.log('  node addToKnowledgeBase.cjs "../src/data/knowledge-base/about_me.txt"');
    console.log('  node addToKnowledgeBase.cjs "new_document.pdf"');
    console.log('  node addToKnowledgeBase.cjs "project_notes.txt"');
    process.exit(1);
}

async function addToKnowledgeBase() {
    console.log(`🚀 Adding to Knowledge Base: ${path.basename(filePath)}\n`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }
    
    const fileExt = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    try {
        let content = '';
        
        // Extract content based on file type
        if (fileExt === '.pdf') {
            console.log('📄 Extracting text from PDF...');
            const pdf = require('pdf-parse');
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            content = data.text;
            console.log(`   ✅ Extracted ${content.length} characters`);
        } else if (fileExt === '.txt' || fileExt === '.md') {
            console.log('📝 Reading text file...');
            content = fs.readFileSync(filePath, 'utf8');
            console.log(`   ✅ Read ${content.length} characters`);
        } else {
            console.error(`❌ Unsupported file type: ${fileExt}`);
            console.log('Supported types: .pdf, .txt, .md');
            process.exit(1);
        }
        
        if (!content || content.trim().length === 0) {
            console.error('❌ No content extracted from file');
            process.exit(1);
        }
        
        // Check if already vectorized
        console.log('🔍 Checking if file already vectorized...');
        const { Pinecone } = require('@pinecone-database/pinecone');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Try to find existing vectors for this file
        const existingQuery = await index.query({
            vector: new Array(1536).fill(0), // dummy vector
            filter: { source: fileName },
            topK: 1,
            includeMetadata: true
        });
        
        if (existingQuery.matches && existingQuery.matches.length > 0) {
            console.log('⚠️  File already vectorized. Deleting old vectors first...');
            
            // Delete old vectors (we'll need to query and delete by ID)
            const allExisting = await index.query({
                vector: new Array(1536).fill(0),
                filter: { source: fileName },
                topK: 10000, // get all matches
                includeMetadata: false
            });
            
            if (allExisting.matches && allExisting.matches.length > 0) {
                const idsToDelete = allExisting.matches.map(match => match.id);
                await index.deleteMany(idsToDelete);
                console.log(`   ✅ Deleted ${idsToDelete.length} old vectors`);
            }
        }
        
        // Chunk the content
        console.log('📝 Chunking content...');
        const chunks = chunkText(content, fileName);
        console.log(`   ✅ Created ${chunks.length} chunks`);
        
        // Generate embeddings and store
        console.log('🧠 Generating embeddings...');
        const { OpenAI } = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`   Processing chunk ${i + 1}/${chunks.length}...`);
            
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunks[i].text
            });
            
            vectors.push({
                id: chunks[i].id,
                values: response.data[0].embedding,
                metadata: {
                    ...chunks[i].metadata,
                    text: chunks[i].text,
                    addedAt: new Date().toISOString()
                }
            });
        }
        console.log(`   ✅ Generated ${vectors.length} embeddings`);
        
        // Store in Pinecone
        console.log('📤 Storing in Pinecone...');
        await index.upsert(vectors);
        console.log(`   ✅ Stored ${vectors.length} vectors in Pinecone`);
        
        console.log('\n🎉 Successfully added to knowledge base!');
        console.log(`📊 Summary:`);
        console.log(`   File: ${fileName}`);
        console.log(`   Type: ${fileExt}`);
        console.log(`   Content length: ${content.length} characters`);
        console.log(`   Chunks created: ${chunks.length}`);
        console.log(`   Vectors stored: ${vectors.length}`);
        console.log(`   Added at: ${new Date().toISOString()}`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

function chunkText(text, filename) {
    const chunks = [];
    const CHUNK_SIZE = 1000;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;
        
        const testChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
        
        if (testChunk.length <= CHUNK_SIZE) {
            currentChunk = testChunk;
        } else {
            if (currentChunk) {
                chunks.push({
                    id: `${filename.replace(/[^a-zA-Z0-9]/g, '_')}-chunk-${chunkIndex}`,
                    text: currentChunk + '.',
                    metadata: {
                        source: filename,
                        chunkIndex: chunkIndex,
                        length: currentChunk.length
                    }
                });
                chunkIndex++;
            }
            currentChunk = trimmedSentence;
        }
    }
    
    if (currentChunk) {
        chunks.push({
            id: `${filename.replace(/[^a-zA-Z0-9]/g, '_')}-chunk-${chunkIndex}`,
            text: currentChunk + '.',
            metadata: {
                source: filename,
                chunkIndex: chunkIndex,
                length: currentChunk.length
            }
        });
    }
    
    return chunks;
}

addToKnowledgeBase();
