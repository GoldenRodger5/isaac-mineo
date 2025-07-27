#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pdfParse from 'pdf-parse';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 Testing PDF Document Processing\n');

async function testPdfProcessing() {
    try {
        // Test Resume PDF
        const resumePath = join(__dirname, '../public/Mineo, Isaac, Resume.pdf');
        console.log('📄 Testing Resume PDF...');
        console.log('File path:', resumePath);
        console.log('File exists:', fs.existsSync(resumePath));
        
        if (fs.existsSync(resumePath)) {
            const resumeBuffer = fs.readFileSync(resumePath);
            console.log('File size:', resumeBuffer.length, 'bytes');
            
            const resumeData = await pdfParse(resumeBuffer);
            console.log('✅ Resume parsed successfully!');
            console.log('Pages:', resumeData.numpages);
            console.log('Text length:', resumeData.text.length, 'characters');
            console.log('Sample text:', resumeData.text.substring(0, 200).replace(/\s+/g, ' '));
            console.log('');
        }
        
        // Test Transcript PDF
        const transcriptPath = join(__dirname, '../public/Mineo, Isaac, Transcript.pdf');
        console.log('📄 Testing Transcript PDF...');
        console.log('File path:', transcriptPath);
        console.log('File exists:', fs.existsSync(transcriptPath));
        
        if (fs.existsSync(transcriptPath)) {
            const transcriptBuffer = fs.readFileSync(transcriptPath);
            console.log('File size:', transcriptBuffer.length, 'bytes');
            
            const transcriptData = await pdfParse(transcriptBuffer);
            console.log('✅ Transcript parsed successfully!');
            console.log('Pages:', transcriptData.numpages);
            console.log('Text length:', transcriptData.text.length, 'characters');
            console.log('Sample text:', transcriptData.text.substring(0, 200).replace(/\s+/g, ' '));
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ PDF Processing Error:', error.message);
    }
}

await testPdfProcessing();
