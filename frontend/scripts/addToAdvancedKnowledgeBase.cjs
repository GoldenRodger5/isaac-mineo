#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const filePath = process.argv[2];

if (!filePath) {
    console.log('Usage: node addToAdvancedKnowledgeBase.cjs <path-to-file>');
    console.log('Examples:');
    console.log('  node addToAdvancedKnowledgeBase.cjs "../../knowledge-base/EchoPodCastReadMe.md"');
    console.log('  node addToAdvancedKnowledgeBase.cjs "../../knowledge-base/QuiziumReadMe.md"');
    process.exit(1);
}

// Index classification
const IndexType = {
    PROJECTS: 'isaac-projects',
    PROFESSIONAL: 'isaac-professional', 
    PERSONAL: 'isaac-personal'
};

async function addToAdvancedKnowledgeBase() {
    console.log(`🚀 Adding to Advanced Knowledge Base: ${path.basename(filePath)}\n`);
    
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
        
        // Classify content to determine target index
        const targetIndex = classifyContent(content, fileName);
        console.log(`🎯 Target index: ${targetIndex}`);
        
        // Initialize Pinecone client
        const { Pinecone } = require('@pinecone-database/pinecone');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        // Ensure target index exists
        await ensureIndexExists(pinecone, targetIndex);
        const index = pinecone.index(targetIndex);
        
        // Check if already vectorized and clean up old vectors
        console.log('🔍 Checking for existing vectors...');
        await cleanupOldVectors(index, fileName);
        
        // Advanced chunking
        console.log('📝 Performing advanced chunking...');
        const chunks = performAdvancedChunking(content, fileName);
        console.log(`   ✅ Created ${chunks.length} semantic chunks`);
        
        // Generate embeddings with text-embedding-3-large
        console.log('🧠 Generating embeddings with text-embedding-3-large...');
        const { OpenAI } = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            console.log(`   Processing chunk ${i + 1}/${chunks.length}...`);
            
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-large',
                input: chunks[i].text,
                dimensions: 3072  // Full dimension for best quality
            });
            
            vectors.push({
                id: chunks[i].id,
                values: response.data[0].embedding,
                metadata: {
                    ...chunks[i].metadata,
                    text: chunks[i].text,
                    addedAt: new Date().toISOString(),
                    index_type: targetIndex,
                    embedding_model: 'text-embedding-3-large'
                }
            });
        }
        console.log(`   ✅ Generated ${vectors.length} high-quality embeddings`);
        
        // Store in appropriate Pinecone index
        console.log(`📤 Storing in ${targetIndex} index...`);
        await index.upsert(vectors);
        console.log(`   ✅ Stored ${vectors.length} vectors`);
        
        console.log('\n🎉 Successfully added to advanced knowledge base!');
        console.log(`📊 Summary:`);
        console.log(`   File: ${fileName}`);
        console.log(`   Type: ${fileExt}`);
        console.log(`   Target Index: ${targetIndex}`);
        console.log(`   Content length: ${content.length} characters`);
        console.log(`   Semantic chunks: ${chunks.length}`);
        console.log(`   Vectors stored: ${vectors.length}`);
        console.log(`   Embedding model: text-embedding-3-large (3072 dimensions)`);
        console.log(`   Added at: ${new Date().toISOString()}`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

function classifyContent(content, fileName) {
    const contentLower = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    // Project indicators
    const projectIndicators = [
        'project', 'repository', 'github', 'application', 'app', 'feature', 'technology',
        'framework', 'api', 'database', 'code', 'implementation', 'development',
        'nutrivize', 'quizium', 'echopodcast', 'fastapi', 'react', 'python', 'readme'
    ];
    
    // Professional indicators
    const professionalIndicators = [
        'resume', 'cv', 'experience', 'education', 'university', 'degree', 'skill',
        'employment', 'work', 'career', 'qualification', 'transcript', 'gpa'
    ];
    
    // Count indicators
    const projectScore = projectIndicators.reduce((score, indicator) => 
        score + (contentLower.includes(indicator) ? 1 : 0) + (fileNameLower.includes(indicator) ? 2 : 0), 0);
    const professionalScore = professionalIndicators.reduce((score, indicator) => 
        score + (contentLower.includes(indicator) ? 1 : 0) + (fileNameLower.includes(indicator) ? 2 : 0), 0);
    
    // Classify based on scores
    if (projectScore > professionalScore) {
        return IndexType.PROJECTS;
    } else if (professionalScore > projectScore) {
        return IndexType.PROFESSIONAL;
    } else {
        return IndexType.PERSONAL;
    }
}

async function ensureIndexExists(pinecone, indexName) {
    try {
        const existingIndexes = await pinecone.listIndexes();
        const indexNames = existingIndexes.indexes?.map(idx => idx.name) || [];
        
        if (!indexNames.includes(indexName)) {
            console.log(`🏗️  Creating new index: ${indexName}`);
            await pinecone.createIndex({
                name: indexName,
                dimension: 3072,  // text-embedding-3-large dimension
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            console.log(`   ✅ Created index: ${indexName}`);
            
            // Wait for index to be ready
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    } catch (error) {
        console.error(`❌ Error ensuring index exists: ${error.message}`);
        throw error;
    }
}

async function cleanupOldVectors(index, fileName) {
    try {
        // Query for existing vectors from this file
        const dummyVector = new Array(3072).fill(0);
        const existingQuery = await index.query({
            vector: dummyVector,
            filter: { source: fileName },
            topK: 1000,
            includeMetadata: false
        });
        
        if (existingQuery.matches && existingQuery.matches.length > 0) {
            console.log(`⚠️  Found ${existingQuery.matches.length} existing vectors. Cleaning up...`);
            const idsToDelete = existingQuery.matches.map(match => match.id);
            await index.deleteMany(idsToDelete);
            console.log(`   ✅ Deleted ${idsToDelete.length} old vectors`);
        }
    } catch (error) {
        console.log(`   ⚠️  Could not cleanup old vectors: ${error.message}`);
    }
}

function performAdvancedChunking(text, filename) {
    const chunks = [];
    
    // First, try semantic chunking based on document structure
    if (filename.toLowerCase().includes('readme')) {
        return chunkMarkdownDocument(text, filename);
    } else if (filename.toLowerCase().includes('resume') || filename.toLowerCase().includes('cv')) {
        return chunkResumeDocument(text, filename);
    } else {
        return chunkGenericDocument(text, filename);
    }
}

function chunkMarkdownDocument(text, filename) {
    const chunks = [];
    let chunkIndex = 0;
    
    // Split by major sections (## headings)
    const sections = text.split(/\n##\s+/).filter(section => section.trim().length > 0);
    
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section.length === 0) continue;
        
        // If section is too long, split further
        if (section.length > 2000) {
            const subsections = splitLongSection(section, 1500);
            for (const subsection of subsections) {
                chunks.push(createChunk(subsection, filename, chunkIndex++, 'markdown_section'));
            }
        } else {
            chunks.push(createChunk(section, filename, chunkIndex++, 'markdown_section'));
        }
    }
    
    return chunks;
}

function chunkResumeDocument(text, filename) {
    const chunks = [];
    let chunkIndex = 0;
    
    // Split by logical resume sections
    const sectionPatterns = [
        /EDUCATION/i, /EXPERIENCE/i, /SKILLS/i, /PROJECTS/i, /CERTIFICATIONS/i, 
        /AWARDS/i, /PUBLICATIONS/i, /CONTACT/i, /OBJECTIVE/i, /SUMMARY/i
    ];
    
    const sections = splitBySections(text, sectionPatterns);
    
    for (const section of sections) {
        if (section.trim().length > 100) {
            chunks.push(createChunk(section, filename, chunkIndex++, 'resume_section'));
        }
    }
    
    return chunks;
}

function chunkGenericDocument(text, filename) {
    const chunks = [];
    let chunkIndex = 0;
    const CHUNK_SIZE = 1200;
    const OVERLAP = 200;
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        const testChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
        
        if (testChunk.length <= CHUNK_SIZE) {
            currentChunk = testChunk;
        } else {
            if (currentChunk) {
                chunks.push(createChunk(currentChunk, filename, chunkIndex++, 'paragraph_group'));
                
                // Create overlap
                const words = currentChunk.split(' ');
                const overlapWords = words.slice(-Math.floor(OVERLAP / 6)); // Approximate words for overlap
                currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
            } else {
                currentChunk = paragraph;
            }
        }
    }
    
    if (currentChunk) {
        chunks.push(createChunk(currentChunk, filename, chunkIndex++, 'paragraph_group'));
    }
    
    return chunks;
}

function splitLongSection(text, maxLength) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
        const testChunk = currentChunk + (currentChunk ? '. ' : '') + sentence.trim();
        
        if (testChunk.length <= maxLength) {
            currentChunk = testChunk;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk + '.');
            }
            currentChunk = sentence.trim();
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk + '.');
    }
    
    return chunks;
}

function splitBySections(text, patterns) {
    const sections = [];
    let currentSection = '';
    const lines = text.split('\n');
    
    for (const line of lines) {
        const isNewSection = patterns.some(pattern => pattern.test(line));
        
        if (isNewSection && currentSection.trim()) {
            sections.push(currentSection.trim());
            currentSection = line;
        } else {
            currentSection += '\n' + line;
        }
    }
    
    if (currentSection.trim()) {
        sections.push(currentSection.trim());
    }
    
    return sections;
}

function createChunk(text, filename, index, chunkType) {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9]/g, '_');
    
    return {
        id: `${sanitizedFilename}_${chunkType}_${index}`,
        text: text.trim(),
        metadata: {
            source: filename,
            chunkIndex: index,
            chunkType: chunkType,
            length: text.length,
            wordCount: text.split(/\s+/).length
        }
    };
}

addToAdvancedKnowledgeBase();
