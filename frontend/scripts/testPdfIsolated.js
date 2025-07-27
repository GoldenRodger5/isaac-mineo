#!/usr/bin/env node
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

console.log('🔍 Testing PDF Library Import Issue\n');

// First, test if the error occurs just from importing
console.log('1. Testing pdf-parse import...');
try {
    console.log('   Importing pdf-parse...');
    const { default: pdfParse } = await import('pdf-parse');
    console.log('   ✅ Import successful');
    
    // Now test if we can access our files without calling pdfParse
    console.log('2. Testing file access...');
    const fs = await import('fs');
    const path = await import('path');
    
    const resumePath = path.join(__dirname, '../public/Mineo, Isaac, Resume.pdf');
    const transcriptPath = path.join(__dirname, '../public/Mineo, Isaac, Transcript.pdf');
    
    console.log('   Resume file exists:', fs.existsSync(resumePath));
    console.log('   Transcript file exists:', fs.existsSync(transcriptPath));
    
    if (fs.existsSync(resumePath)) {
        const stats = fs.statSync(resumePath);
        console.log('   Resume file size:', stats.size, 'bytes');
    }
    
    if (fs.existsSync(transcriptPath)) {
        const stats = fs.statSync(transcriptPath);
        console.log('   Transcript file size:', stats.size, 'bytes');
    }
    
    // Now try actual parsing
    console.log('3. Testing actual PDF parsing...');
    if (fs.existsSync(resumePath)) {
        console.log('   Reading resume file...');
        const resumeBuffer = fs.readFileSync(resumePath);
        console.log('   Buffer created, size:', resumeBuffer.length);
        
        console.log('   Parsing with pdf-parse...');
        const resumeData = await pdfParse(resumeBuffer);
        console.log('   ✅ Resume parsed successfully!');
        console.log('   Pages:', resumeData.numpages);
        console.log('   Text length:', resumeData.text.length, 'characters');
        console.log('   Sample:', resumeData.text.substring(0, 150).replace(/\s+/g, ' '));
    }
    
    if (fs.existsSync(transcriptPath)) {
        console.log('   Reading transcript file...');
        const transcriptBuffer = fs.readFileSync(transcriptPath);
        console.log('   Buffer created, size:', transcriptBuffer.length);
        
        console.log('   Parsing with pdf-parse...');
        const transcriptData = await pdfParse(transcriptBuffer);
        console.log('   ✅ Transcript parsed successfully!');
        console.log('   Pages:', transcriptData.numpages);
        console.log('   Text length:', transcriptData.text.length, 'characters');
        console.log('   Sample:', transcriptData.text.substring(0, 150).replace(/\s+/g, ' '));
    }
    
} catch (error) {
    console.log('❌ Error occurred at step:', error.message);
    console.log('Stack trace (first few lines):');
    console.log(error.stack.split('\n').slice(0, 5).join('\n'));
}

console.log('\n✨ PDF Test Complete!');
