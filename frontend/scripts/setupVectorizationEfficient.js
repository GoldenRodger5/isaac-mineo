const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const KNOWLEDGE_BASE_DIR = path.join(__dirname, '..', '..', 'knowledge-base');
const DOCUMENTS_DIR = path.join(KNOWLEDGE_BASE_DIR, 'documents');
const TEXT_CONTENT_DIR = path.join(KNOWLEDGE_BASE_DIR, 'text-content');
const METADATA_FILE = path.join(KNOWLEDGE_BASE_DIR, 'vectorization-metadata.json');

console.log('🚀 Memory-Efficient Document Vectorization Setup\n');

// Skip PDF processing for now to avoid memory issues
async function processPDF(filePath) {
    console.log(`   ⏭️  Skipping PDF processing (memory optimization): ${path.basename(filePath)}`);
    return null;
}

async function processTextFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`   📝 Loaded ${content.length} characters from text file`);
        return content;
    } catch (error) {
        console.error(`   ❌ Error reading text file: ${error.message}`);
        return null;
    }
}

function chunkText(text, filename) {
    const chunks = [];
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
                    id: `${filename}-chunk-${chunkIndex}`,
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
            id: `${filename}-chunk-${chunkIndex}`,
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

async function generateEmbedding(text) {
    try {
        // Initialize OpenAI only when needed
        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        });
        
        return response.data[0].embedding;
    } catch (error) {
        console.error('   ❌ Embedding generation failed:', error.message);
        return null;
    }
}

async function storeInPinecone(chunks) {
    try {
        const { Pinecone } = require('@pinecone-database/pinecone');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        
        console.log(`   🔗 Generating embeddings for ${chunks.length} chunks...`);
        
        // Process chunks one at a time to avoid memory issues
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`      Processing chunk ${i + 1}/${chunks.length}...`);
            
            const embedding = await generateEmbedding(chunk.text);
            if (embedding) {
                vectors.push({
                    id: chunk.id,
                    values: embedding,
                    metadata: {
                        ...chunk.metadata,
                        text: chunk.text
                    }
                });
            }
            
            // Force garbage collection every 5 chunks
            if (i % 5 === 0 && global.gc) {
                global.gc();
            }
        }
        
        if (vectors.length > 0) {
            console.log(`   📤 Uploading ${vectors.length} vectors to Pinecone...`);
            await index.upsert(vectors);
            console.log(`   ✅ Successfully stored ${vectors.length} vectors`);
        }
        
        return vectors.length;
    } catch (error) {
        console.error(`   ❌ Pinecone storage failed: ${error.message}`);
        return 0;
    }
}

function getFileHash(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
        return null;
    }
}

function loadMetadata() {
    if (fs.existsSync(METADATA_FILE)) {
        try {
            const content = fs.readFileSync(METADATA_FILE, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn('⚠️  Could not load metadata file, starting fresh');
        }
    }
    return { files: {}, lastRun: null };
}

function saveMetadata(metadata) {
    try {
        fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    } catch (error) {
        console.error('❌ Could not save metadata:', error.message);
    }
}

async function processDocument(filePath, metadata) {
    const filename = path.basename(filePath);
    const fileHash = getFileHash(filePath);
    
    if (!fileHash) {
        console.log(`📄 Skipping ${filename} (could not read file)`);
        return 0;
    }
    
    // Check if file has changed
    if (metadata.files[filename] && metadata.files[filename].hash === fileHash) {
        console.log(`📄 Skipping ${filename} (unchanged)`);
        return 0;
    }
    
    console.log(`📄 Processing ${filename}...`);
    
    let content = null;
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
        content = await processPDF(filePath);
    } else {
        content = await processTextFile(filePath);
    }
    
    if (!content) {
        console.log(`   ⏭️  Skipped ${filename} (no content extracted)`);
        return 0;
    }
    
    const chunks = chunkText(content, filename);
    console.log(`   📋 Created ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
        return 0;
    }
    
    const storedCount = await storeInPinecone(chunks);
    
    // Update metadata
    metadata.files[filename] = {
        hash: fileHash,
        lastProcessed: new Date().toISOString(),
        chunks: storedCount
    };
    
    return storedCount;
}

async function main() {
    try {
        const metadata = loadMetadata();
        let totalVectors = 0;
        
        // Process text content files
        console.log('\n📚 Processing text content files...');
        if (fs.existsSync(TEXT_CONTENT_DIR)) {
            const textFiles = fs.readdirSync(TEXT_CONTENT_DIR).filter(f => f.endsWith('.txt'));
            
            for (const file of textFiles) {
                const filePath = path.join(TEXT_CONTENT_DIR, file);
                const count = await processDocument(filePath, metadata);
                totalVectors += count;
            }
        }
        
        // Process documents (skip PDFs for now)
        console.log('\n📄 Processing document files...');
        if (fs.existsSync(DOCUMENTS_DIR)) {
            const docFiles = fs.readdirSync(DOCUMENTS_DIR);
            
            for (const file of docFiles) {
                if (file.endsWith('.txt')) { // Only process text files for now
                    const filePath = path.join(DOCUMENTS_DIR, file);
                    const count = await processDocument(filePath, metadata);
                    totalVectors += count;
                }
            }
        }
        
        metadata.lastRun = new Date().toISOString();
        saveMetadata(metadata);
        
        console.log('\n🎉 Vectorization complete!');
        console.log(`📊 Total vectors created: ${totalVectors}`);
        console.log(`💾 Metadata saved to: ${METADATA_FILE}`);
        
    } catch (error) {
        console.error('\n❌ Vectorization failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
