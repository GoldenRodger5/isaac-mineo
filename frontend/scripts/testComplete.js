#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🚀 Testing AI Portfolio Functionality\n');

// Test environment variables
console.log('📋 Environment Check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Missing');
console.log('');

// Test Redis connection
console.log('🔄 Testing Redis Connection...');
try {
    const { createClient } = await import('redis');
    const redisClient = createClient({
        url: process.env.REDIS_URL
    });
    
    await redisClient.connect();
    await redisClient.set('test:connection', 'success', { EX: 10 });
    const result = await redisClient.get('test:connection');
    console.log('Redis:', result === 'success' ? '✅ Connected' : '❌ Failed');
    await redisClient.disconnect();
} catch (error) {
    console.log('Redis: ❌ Error -', error.message);
}

// Test Pinecone connection
console.log('🔄 Testing Pinecone Connection...');
try {
    const { Pinecone } = await import('@pinecone-database/pinecone');
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });
    
    const indexes = await pinecone.listIndexes();
    console.log('Pinecone: ✅ Connected, indexes:', indexes.indexes?.length || 0);
} catch (error) {
    console.log('Pinecone: ❌ Error -', error.message);
}

// Test OpenAI connection
console.log('🔄 Testing OpenAI Connection...');
try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    
    // Test with a simple request
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'Test connection',
    });
    
    console.log('OpenAI: ✅ Connected, embedding dimension:', response.data[0].embedding.length);
} catch (error) {
    console.log('OpenAI: ❌ Error -', error.message);
}

// Test Claude connection
console.log('🔄 Testing Claude Connection...');
try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test' }]
        })
    });
    
    if (response.ok) {
        console.log('Claude: ✅ Connected');
    } else {
        const errorText = await response.text();
        console.log('Claude: ❌ Error -', response.status, errorText.substring(0, 100));
    }
} catch (error) {
    console.log('Claude: ❌ Error -', error.message);
}

console.log('\n🔍 Testing Document Processing...');

// Test PDF processing
try {
    const { default: pdfParse } = await import('pdf-parse');
    const fs = await import('fs');
    const path = await import('path');
    
    // Test both resume files
    const resumePath1 = path.join(__dirname, '../public/IsaacMineo_Resume.pdf');
    const resumePath2 = path.join(__dirname, '../public/Mineo, Isaac, Resume.pdf');
    
    if (fs.existsSync(resumePath1)) {
        const dataBuffer = fs.readFileSync(resumePath1);
        const data = await pdfParse(dataBuffer);
        console.log('Resume PDF (IsaacMineo_Resume.pdf): ✅ Parsed,', data.text.length, 'characters');
        console.log('Sample text:', data.text.substring(0, 100) + '...');
    } else if (fs.existsSync(resumePath2)) {
        const dataBuffer = fs.readFileSync(resumePath2);
        const data = await pdfParse(dataBuffer);
        console.log('Resume PDF (Mineo, Isaac, Resume.pdf): ✅ Parsed,', data.text.length, 'characters');
        console.log('Sample text:', data.text.substring(0, 100) + '...');
    } else {
        console.log('Resume PDF: ❌ File not found at either path');
        console.log('Checked paths:');
        console.log('  -', resumePath1);
        console.log('  -', resumePath2);
    }
    
    const transcriptPath = path.join(__dirname, '../public/Mineo, Isaac, Transcript.pdf');
    if (fs.existsSync(transcriptPath)) {
        const dataBuffer = fs.readFileSync(transcriptPath);
        const data = await pdfParse(dataBuffer);
        console.log('Transcript PDF: ✅ Parsed,', data.text.length, 'characters');
    } else {
        console.log('Transcript PDF: ❌ File not found');
    }
} catch (error) {
    console.log('PDF Processing: ❌ Error -', error.message);
}

console.log('\n✨ Testing Complete!');
