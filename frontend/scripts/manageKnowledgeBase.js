#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📚 Knowledge Base Management Tool\n');

const KNOWLEDGE_BASE_DIR = join(__dirname, '../knowledge-base');
const DOCUMENTS_DIR = join(KNOWLEDGE_BASE_DIR, 'documents');
const TEXT_CONTENT_DIR = join(KNOWLEDGE_BASE_DIR, 'text-content');

function showUsage() {
    console.log('Usage:');
    console.log('  node scripts/manageKnowledgeBase.js list                    # List all files');
    console.log('  node scripts/manageKnowledgeBase.js add-text <file>        # Add text file');
    console.log('  node scripts/manageKnowledgeBase.js add-pdf <file>         # Add PDF file');
    console.log('  node scripts/manageKnowledgeBase.js stats                  # Show statistics');
    console.log('  node scripts/manageKnowledgeBase.js validate               # Validate all files');
}

function listFiles() {
    console.log('📄 Current Knowledge Base Contents:\n');
    
    console.log('📁 Documents (PDFs):');
    if (fs.existsSync(DOCUMENTS_DIR)) {
        const pdfs = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.endsWith('.pdf'));
        if (pdfs.length === 0) {
            console.log('   (No PDF documents)');
        } else {
            pdfs.forEach(pdf => {
                const stats = fs.statSync(join(DOCUMENTS_DIR, pdf));
                console.log(`   ✓ ${pdf} (${(stats.size / 1024).toFixed(1)} KB)`);
            });
        }
    }
    
    console.log('\n📁 Text Content:');
    if (fs.existsSync(TEXT_CONTENT_DIR)) {
        const texts = fs.readdirSync(TEXT_CONTENT_DIR).filter(f => f.endsWith('.txt'));
        if (texts.length === 0) {
            console.log('   (No text files)');
        } else {
            texts.forEach(txt => {
                const content = fs.readFileSync(join(TEXT_CONTENT_DIR, txt), 'utf8');
                console.log(`   ✓ ${txt} (${content.length} characters)`);
            });
        }
    }
}

function addTextFile(sourceFile) {
    if (!fs.existsSync(sourceFile)) {
        console.log(`❌ Source file not found: ${sourceFile}`);
        return;
    }
    
    const fileName = path.basename(sourceFile);
    const targetPath = join(TEXT_CONTENT_DIR, fileName);
    
    if (fs.existsSync(targetPath)) {
        console.log(`⚠️  File already exists: ${fileName}`);
        console.log('   Overwrite? (This will require re-indexing)');
        return;
    }
    
    fs.copyFileSync(sourceFile, targetPath);
    console.log(`✅ Added text file: ${fileName}`);
    console.log(`   Location: knowledge-base/text-content/${fileName}`);
    console.log('   💡 Remember to update setupVectorization.js to include this file');
}

function addPdfFile(sourceFile) {
    if (!fs.existsSync(sourceFile)) {
        console.log(`❌ Source file not found: ${sourceFile}`);
        return;
    }
    
    const fileName = path.basename(sourceFile);
    const targetPath = join(DOCUMENTS_DIR, fileName);
    
    if (fs.existsSync(targetPath)) {
        console.log(`⚠️  File already exists: ${fileName}`);
        console.log('   Overwrite? (This will require re-indexing)');
        return;
    }
    
    fs.copyFileSync(sourceFile, targetPath);
    console.log(`✅ Added PDF document: ${fileName}`);
    console.log(`   Location: knowledge-base/documents/${fileName}`);
    console.log('   💡 Remember to update setupVectorization.js to include this file');
}

function showStats() {
    console.log('📊 Knowledge Base Statistics:\n');
    
    let totalFiles = 0;
    let totalSize = 0;
    let totalTextLength = 0;
    
    // Count PDFs
    if (fs.existsSync(DOCUMENTS_DIR)) {
        const pdfs = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.endsWith('.pdf'));
        pdfs.forEach(pdf => {
            const stats = fs.statSync(join(DOCUMENTS_DIR, pdf));
            totalFiles++;
            totalSize += stats.size;
        });
        console.log(`📄 PDF Documents: ${pdfs.length}`);
    }
    
    // Count text files
    if (fs.existsSync(TEXT_CONTENT_DIR)) {
        const texts = fs.readdirSync(TEXT_CONTENT_DIR).filter(f => f.endsWith('.txt'));
        texts.forEach(txt => {
            const content = fs.readFileSync(join(TEXT_CONTENT_DIR, txt), 'utf8');
            totalFiles++;
            totalTextLength += content.length;
        });
        console.log(`📝 Text Files: ${texts.length}`);
    }
    
    console.log(`📁 Total Files: ${totalFiles}`);
    console.log(`💾 Total Size: ${(totalSize / 1024).toFixed(1)} KB`);
    console.log(`📖 Total Text Content: ${totalTextLength.toLocaleString()} characters`);
    
    // Check processing status
    const processedFile = join(__dirname, '../.processed-docs.json');
    if (fs.existsSync(processedFile)) {
        const processed = JSON.parse(fs.readFileSync(processedFile, 'utf8'));
        console.log(`\n🔄 Processing Status:`);
        console.log(`   Processed Documents: ${Object.keys(processed).length}`);
        console.log(`   Last Update: ${Object.values(processed)[0]?.processed_at || 'Unknown'}`);
    } else {
        console.log(`\n⚠️  No processing history found. Run setupVectorization.js first.`);
    }
}

function validateFiles() {
    console.log('🔍 Validating Knowledge Base Files:\n');
    
    let allValid = true;
    
    // Validate text files
    if (fs.existsSync(TEXT_CONTENT_DIR)) {
        const texts = fs.readdirSync(TEXT_CONTENT_DIR).filter(f => f.endsWith('.txt'));
        texts.forEach(txt => {
            const filePath = join(TEXT_CONTENT_DIR, txt);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.length < 50) {
                    console.log(`⚠️  ${txt}: Very short content (${content.length} chars)`);
                } else {
                    console.log(`✅ ${txt}: Valid (${content.length} chars)`);
                }
            } catch (error) {
                console.log(`❌ ${txt}: Read error - ${error.message}`);
                allValid = false;
            }
        });
    }
    
    // Validate PDFs
    if (fs.existsSync(DOCUMENTS_DIR)) {
        const pdfs = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.endsWith('.pdf'));
        pdfs.forEach(pdf => {
            const filePath = join(DOCUMENTS_DIR, pdf);
            try {
                const stats = fs.statSync(filePath);
                if (stats.size < 1000) {
                    console.log(`⚠️  ${pdf}: Very small file (${stats.size} bytes)`);
                } else {
                    console.log(`✅ ${pdf}: Valid (${(stats.size / 1024).toFixed(1)} KB)`);
                }
            } catch (error) {
                console.log(`❌ ${pdf}: Access error - ${error.message}`);
                allValid = false;
            }
        });
    }
    
    console.log(`\n${allValid ? '✅' : '❌'} Validation ${allValid ? 'passed' : 'failed'}`);
}

// Parse command line arguments
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
    case 'list':
        listFiles();
        break;
    case 'add-text':
        if (!arg) {
            console.log('❌ Please specify a text file to add');
            showUsage();
        } else {
            addTextFile(arg);
        }
        break;
    case 'add-pdf':
        if (!arg) {
            console.log('❌ Please specify a PDF file to add');
            showUsage();
        } else {
            addPdfFile(arg);
        }
        break;
    case 'stats':
        showStats();
        break;
    case 'validate':
        validateFiles();
        break;
    default:
        showUsage();
        break;
}
