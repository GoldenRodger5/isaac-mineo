#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🚀 Document Vectorization & Indexing Setup\n');

// Track processed documents
const PROCESSED_DOCS_FILE = join(__dirname, '../.processed-docs.json');

// Load previously processed documents
function loadProcessedDocs() {
    try {
        if (fs.existsSync(PROCESSED_DOCS_FILE)) {
            return JSON.parse(fs.readFileSync(PROCESSED_DOCS_FILE, 'utf8'));
        }
    } catch (error) {
        console.log('Note: Could not load processed docs file, starting fresh');
    }
    return {};
}

// Save processed documents
function saveProcessedDocs(processedDocs) {
    fs.writeFileSync(PROCESSED_DOCS_FILE, JSON.stringify(processedDocs, null, 2));
}

// Get file hash to detect changes
function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

// Chunk text into smaller pieces for better embedding
function chunkText(text, maxChunkSize = 1000, overlap = 100) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
        let end = Math.min(start + maxChunkSize, text.length);
        
        // Try to end at a sentence boundary
        if (end < text.length) {
            const lastPeriod = text.lastIndexOf('.', end);
            const lastNewline = text.lastIndexOf('\n', end);
            const boundary = Math.max(lastPeriod, lastNewline);
            
            if (boundary > start + maxChunkSize * 0.5) {
                end = boundary + 1;
            }
        }
        
        chunks.push({
            text: text.slice(start, end).trim(),
            start: start,
            end: end
        });
        
        start = end - overlap;
    }
    
    return chunks.filter(chunk => chunk.text.length > 50); // Filter out tiny chunks
}

async function vectorizeAndIndex() {
    const processedDocs = loadProcessedDocs();
    
    try {
        // Initialize APIs
        console.log('🔧 Initializing APIs...');
        const { OpenAI } = await import('openai');
        const { Pinecone } = await import('@pinecone-database/pinecone');
        
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        
        const indexName = 'isaac-portfolio';
        let index;
        
        try {
            index = pinecone.index(indexName);
            console.log('✅ Connected to Pinecone index:', indexName);
        } catch (error) {
            console.log('❌ Pinecone index not found. Please create index "isaac-portfolio" first.');
            return;
        }
        
        // Documents to process
        const documents = [
            {
                id: 'resume',
                filePath: join(__dirname, '../knowledge-base/documents/isaac-mineo-resume.pdf'),
                type: 'pdf',
                title: 'Isaac Mineo Resume'
            },
            {
                id: 'transcript',
                filePath: join(__dirname, '../knowledge-base/documents/isaac-mineo-transcript.pdf'),
                type: 'pdf',
                title: 'Isaac Mineo Academic Transcript'
            },
            {
                id: 'about',
                filePath: join(__dirname, '../knowledge-base/text-content/about_me.txt'),
                type: 'text',
                title: 'About Isaac Mineo'
            },
            {
                id: 'tech-stack',
                filePath: join(__dirname, '../knowledge-base/text-content/tech_stack.txt'),
                type: 'text',
                title: 'Technical Skills & Stack'
            },
            {
                id: 'projects',
                filePath: join(__dirname, '../knowledge-base/text-content/projects.txt'),
                type: 'text',
                title: 'Featured Projects'
            },
            {
                id: 'career-goals',
                filePath: join(__dirname, '../knowledge-base/text-content/career_goals.txt'),
                type: 'text',
                title: 'Career Goals & Aspirations'
            }
        ];
        
        for (const doc of documents) {
            console.log(`\n📄 Processing ${doc.title}...`);
            
            // Check if file exists
            if (!fs.existsSync(doc.filePath)) {
                console.log(`   ⚠️  File not found: ${doc.filePath}`);
                continue;
            }
            
            // Check if already processed and unchanged
            const currentHash = getFileHash(doc.filePath);
            if (processedDocs[doc.id] && processedDocs[doc.id].hash === currentHash) {
                console.log(`   ✅ Already processed (unchanged): ${doc.title}`);
                continue;
            }
            
            // Extract text
            let text = '';
            if (doc.type === 'pdf') {
                try {
                    const { default: pdfParse } = await import('pdf-parse');
                    const dataBuffer = fs.readFileSync(doc.filePath);
                    const pdfData = await pdfParse(dataBuffer);
                    text = pdfData.text;
                    console.log(`   📝 Extracted ${text.length} characters from PDF`);
                } catch (error) {
                    console.log(`   ❌ PDF parsing failed: ${error.message}`);
                    continue;
                }
            } else {
                text = fs.readFileSync(doc.filePath, 'utf8');
                console.log(`   📝 Loaded ${text.length} characters from text file`);
            }
            
            // Clean and chunk text
            text = text.replace(/\s+/g, ' ').trim();
            const chunks = chunkText(text);
            console.log(`   🔪 Split into ${chunks.length} chunks`);
            
            // Generate embeddings and upsert to Pinecone
            console.log(`   🔄 Generating embeddings...`);
            const vectors = [];
            
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                
                try {
                    const embeddingResponse = await openai.embeddings.create({
                        model: 'text-embedding-3-small',
                        input: chunk.text,
                    });
                    
                    const vector = {
                        id: `${doc.id}_chunk_${i}`,
                        values: embeddingResponse.data[0].embedding,
                        metadata: {
                            document_id: doc.id,
                            document_title: doc.title,
                            document_type: doc.type,
                            chunk_index: i,
                            chunk_start: chunk.start,
                            chunk_end: chunk.end,
                            text: chunk.text,
                            text_length: chunk.text.length,
                            timestamp: new Date().toISOString()
                        }
                    };
                    
                    vectors.push(vector);
                    
                    // Progress indicator
                    if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
                        process.stdout.write(`\r   🔄 Progress: ${i + 1}/${chunks.length} chunks`);
                    }
                } catch (error) {
                    console.log(`\n   ❌ Embedding failed for chunk ${i}: ${error.message}`);
                }
            }
            
            console.log(`\n   📤 Uploading ${vectors.length} vectors to Pinecone...`);
            
            // Upsert in batches
            const batchSize = 10;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await index.upsert(batch);
                
                process.stdout.write(`\r   📤 Uploaded: ${Math.min(i + batchSize, vectors.length)}/${vectors.length} vectors`);
            }
            
            console.log(`\n   ✅ Successfully processed and indexed: ${doc.title}`);
            
            // Mark as processed
            processedDocs[doc.id] = {
                hash: currentHash,
                processed_at: new Date().toISOString(),
                chunks: chunks.length,
                file_path: doc.filePath
            };
            
            // Add small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Save processed docs
        saveProcessedDocs(processedDocs);
        
        console.log('\n🎉 Document vectorization complete!');
        console.log('\n📊 Summary:');
        Object.entries(processedDocs).forEach(([id, info]) => {
            console.log(`   ${id}: ${info.chunks} chunks (${info.processed_at})`);
        });
        
        // Test search functionality
        console.log('\n🔍 Testing search functionality...');
        const testQuery = "What programming languages does Isaac know?";
        const queryEmbedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: testQuery,
        });
        
        const searchResults = await index.query({
            vector: queryEmbedding.data[0].embedding,
            topK: 3,
            includeMetadata: true
        });
        
        console.log(`   Query: "${testQuery}"`);
        console.log(`   Found ${searchResults.matches.length} results:`);
        searchResults.matches.forEach((match, i) => {
            console.log(`   ${i + 1}. Score: ${match.score.toFixed(3)} - ${match.metadata.document_title}`);
            console.log(`      "${match.metadata.text.substring(0, 100)}..."`);
        });
        
    } catch (error) {
        console.error('❌ Vectorization failed:', error.message);
        throw error;
    }
}

// Run the vectorization
await vectorizeAndIndex();
