#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { initializeKnowledgeBase, healthCheck } from '../src/utils/pineconeEnhanced.js';
import cacheManager from '../src/utils/cacheManager.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function main() {
  console.log('🚀 Initializing Isaac\'s Enhanced Knowledge Base...\n');

  try {
    // Health check first
    console.log('📊 Running health check...');
    const health = await healthCheck();
    console.log('Pinecone:', health.pinecone.connected ? '✅ Connected' : '❌ Failed');
    console.log('Cache:', health.cache.connected ? '✅ Connected' : '❌ Failed');
    console.log();

    // Initialize knowledge base
    console.log('📚 Processing and uploading knowledge base...');
    await initializeKnowledgeBase(openai);
    
    console.log('\n✅ Knowledge base initialization complete!');
    console.log('\nKnowledge sources processed:');
    console.log('• Manual curated knowledge base');
    console.log('• Knowledge base text files (about_me.txt, tech_stack.txt, etc.)');
    console.log('• Resume PDF content');
    console.log('• Transcript PDF content');
    
    console.log('\n🎯 Your enhanced chatbot is now ready with:');
    console.log('• Vector search capabilities');
    console.log('• Redis caching for performance');
    console.log('• Session management');
    console.log('• Rate limiting');
    console.log('• Comprehensive document processing');

    // Final health check
    const finalHealth = await healthCheck();
    if (finalHealth.pinecone.totalVectors > 0) {
      console.log(`\n📈 Vector database contains ${finalHealth.pinecone.totalVectors} knowledge chunks`);
    }

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error('\nPossible issues:');
    console.error('• Missing OPENAI_API_KEY environment variable');
    console.error('• Missing PINECONE_API_KEY environment variable');
    console.error('• Network connectivity issues');
    console.error('• Missing PDF files in public/ directory');
    
    process.exit(1);
  }

  // Cleanup
  await cacheManager.disconnect();
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down gracefully...');
  await cacheManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n👋 Shutting down gracefully...');
  await cacheManager.disconnect();
  process.exit(0);
});

main().catch(console.error);
