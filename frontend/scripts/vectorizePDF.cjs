#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pdfFilePath = process.argv[2];

if (!pdfFilePath) {
    console.log('Usage: node vectorizePDF.cjs <path-to-pdf>');
    console.log('Example: node vectorizePDF.cjs "../public/IsaacMineo_Resume.pdf"');
    process.exit(1);
}

async function vectorizePDF() {
    console.log(`🚀 Vectorizing PDF: ${path.basename(pdfFilePath)}\n`);
    
    // Check if file exists
    if (!fs.existsSync(pdfFilePath)) {
        console.error(`❌ File not found: ${pdfFilePath}`);
        process.exit(1);
    }
    
    try {
        // 1. Extract text from PDF
        console.log('📄 Extracting text from PDF...');
        const pdf = require('pdf-parse');
        const dataBuffer = fs.readFileSync(pdfFilePath);
        const data = await pdf(dataBuffer);
        console.log(`   ✅ Extracted ${data.text.length} characters`);
        
        // 2. Chunk the text
        console.log('📝 Chunking text...');
        const chunks = chunkText(data.text, path.basename(pdfFilePath));
        console.log(`   ✅ Created ${chunks.length} chunks`);
        
        // 3. Generate embeddings
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
                    text: chunks[i].text
                }
            });
        }
        console.log(`   ✅ Generated ${vectors.length} embeddings`);
        
        // 4. Store in Pinecone
        console.log('📤 Storing in Pinecone...');
        const { Pinecone } = require('@pinecone-database/pinecone');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        await index.upsert(vectors);
        console.log(`   ✅ Stored ${vectors.length} vectors in Pinecone`);
        
        console.log('\n🎉 PDF vectorization complete!');
        console.log(`📊 Summary:`);
        console.log(`   File: ${path.basename(pdfFilePath)}`);
        console.log(`   Text length: ${data.text.length} characters`);
        console.log(`   Chunks: ${chunks.length}`);
        console.log(`   Vectors: ${vectors.length}`);
        
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

vectorizePDF();
