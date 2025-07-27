import { Pinecone } from '@pinecone-database/pinecone';
import DocumentProcessor from './documentProcessor.js';
import cacheManager from './cacheManager.js';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const INDEX_NAME = "isaac-info";

// Initialize the index
export const initializePinecone = async () => {
  try {
    // Initialize cache manager
    await cacheManager.connect();
    
    // Check if index exists
    const indexList = await pc.listIndexes();
    const indexExists = indexList.indexes?.some(index => index.name === INDEX_NAME);

    if (!indexExists) {
      // Create index if it doesn't exist
      await pc.createIndex({
        name: INDEX_NAME,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log(`Created index: ${INDEX_NAME}`);
    }

    return pc.index(INDEX_NAME);
  } catch (error) {
    console.error('Error initializing Pinecone:', error);
    throw error;
  }
};

// Create embeddings with caching
export const createEmbedding = async (text, openaiClient) => {
  try {
    // Check cache first
    const cachedEmbedding = await cacheManager.getCachedEmbedding(text);
    if (cachedEmbedding) {
      console.log('Using cached embedding');
      return cachedEmbedding;
    }

    // Generate new embedding
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    const embedding = response.data[0].embedding;
    
    // Cache the embedding (write-through)
    await cacheManager.cacheEmbedding(text, embedding);
    
    return embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
};

// Load and combine all knowledge sources
export const loadAllKnowledgeSources = async () => {
  const allKnowledge = [];

  // 1. Load existing manual knowledge base
  const manualKnowledge = prepareManualKnowledgeBase();
  allKnowledge.push(...manualKnowledge);

  // 2. Load knowledge base text files
  const textFileKnowledge = await loadKnowledgeBaseFiles();
  allKnowledge.push(...textFileKnowledge);

  // 3. Process PDF documents
  const documentProcessor = new DocumentProcessor();
  const documentKnowledge = await documentProcessor.processAllDocuments();
  allKnowledge.push(...documentKnowledge);

  console.log(`Loaded ${allKnowledge.length} total knowledge chunks`);
  return allKnowledge;
};

// Load knowledge base text files
const loadKnowledgeBaseFiles = async () => {
  const knowledgeBasePath = path.join(process.cwd(), 'src/data/knowledge-base');
  const files = ['about_me.txt', 'tech_stack.txt', 'projects.txt', 'career_goals.txt'];
  const knowledge = [];

  for (const file of files) {
    try {
      const filePath = path.join(knowledgeBasePath, file);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf8');
        
        // Chunk the content if it's long
        const documentProcessor = new DocumentProcessor();
        const chunks = documentProcessor.chunkText(content, {
          source: file.replace('.txt', ''),
          category: file.includes('tech') ? 'skills' : file.includes('about') ? 'personal' : 
                   file.includes('projects') ? 'projects' : 'career',
          type: 'knowledge_base'
        });

        knowledge.push(...chunks);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return knowledge;
};

// Manual knowledge base (existing curated content)
export const prepareManualKnowledgeBase = () => {
  return [
    {
      id: 'about-me-summary',
      text: `Isaac Mineo is a passionate Full-Stack Developer and AI Engineer who thrives on building useful, intelligent, and scalable web applications. He cares deeply about clean code, performance, and crafting digital tools that make real-world impact. Isaac specializes in backend architecture and AI integration. He's a problem solver who enjoys tackling complex technical challenges and values clean, maintainable code. Isaac is actively seeking backend, AI engineering, or full-stack roles where he can build meaningful tools alongside smart, creative teams. He's especially interested in opportunities with healthtech, AI, productivity, or developer tooling companies.`,
      metadata: { category: 'personal', type: 'about', source: 'manual' }
    },
    {
      id: 'tech-stack-frontend',
      text: `Isaac's frontend skills include React 18 (expert level), JavaScript/TypeScript (advanced), Tailwind CSS (advanced), Vite, HTML5/CSS3, and responsive design. He's an expert in React hooks, context, state management, and building responsive, mobile-first applications with cross-browser compatibility.`,
      metadata: { category: 'skills', type: 'frontend', source: 'manual' }
    },
    {
      id: 'tech-stack-backend',
      text: `Isaac's backend expertise includes FastAPI (expert level), Python (advanced), Node.js, RESTful API design, and database design. He specializes in building scalable backend systems, async programming, and clean API architecture with comprehensive documentation.`,
      metadata: { category: 'skills', type: 'backend', source: 'manual' }
    },
    {
      id: 'tech-stack-ai',
      text: `Isaac has advanced experience with AI integration, particularly OpenAI API integration, Claude API, prompt engineering, and vector databases. He's skilled in building AI-powered applications and implementing smart features with automation. He's learning about Pinecone and embeddings for vector search.`,
      metadata: { category: 'skills', type: 'ai', source: 'manual' }
    },
    {
      id: 'tech-stack-databases',
      text: `Isaac works with MongoDB (advanced), PostgreSQL, Redis for caching and session management, and Firebase Firestore for real-time databases. He's experienced in NoSQL and relational database design, schema optimization, and performance tuning.`,
      metadata: { category: 'skills', type: 'databases', source: 'manual' }
    },
    {
      id: 'nutrivize-project',
      text: `Nutrivize is Isaac's flagship project - an intelligent nutrition tracking application that uses AI to automatically recognize foods from photos and provides personalized nutritional insights. Built with React 18, FastAPI, MongoDB, Firebase Auth, OpenAI GPT-4 Vision, and Redis Cloud. Features include AI-powered food photo recognition, personalized macro tracking, smart meal suggestions, social sharing, progress tracking, and offline functionality. The app is deployed on Vercel and Render and actively used by beta testers.`,
      metadata: { category: 'projects', type: 'flagship', source: 'manual' }
    },
    {
      id: 'career-goals',
      text: `Isaac is looking for backend developer, AI engineer, or full-stack developer roles focusing on API development, AI integration, and scalable systems. He's excited about healthtech, AI/ML companies, productivity tools, developer tooling, EdTech, FinTech, and SaaS companies. He prefers startup environments (10-500 employees) with collaborative teams, remote-friendly work, strong engineering culture, and opportunities for continuous learning. Isaac values building meaningful technology that makes a positive impact.`,
      metadata: { category: 'career', type: 'goals', source: 'manual' }
    },
    {
      id: 'contact-info',
      text: `Isaac can be reached at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, and LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing interesting opportunities and projects. He's available for remote work and open to relocation for the right opportunity.`,
      metadata: { category: 'contact', type: 'info', source: 'manual' }
    }
  ];
};

// Function to upsert all knowledge to Pinecone
export const upsertAllKnowledge = async (openai) => {
  try {
    const index = await initializePinecone();
    
    // Load all knowledge sources
    const allKnowledge = await loadAllKnowledgeSources();
    
    console.log(`Upserting ${allKnowledge.length} knowledge chunks to Pinecone...`);
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < allKnowledge.length; i += batchSize) {
      batches.push(allKnowledge.slice(i, i + batchSize));
    }

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);
      
      // Generate embeddings for batch
      const vectors = await Promise.all(
        batch.map(async (item, index) => {
          const embedding = await createEmbedding(item.text, openai);
          
          return {
            id: item.id || `chunk-${batchIndex}-${index}`,
            values: embedding,
            metadata: {
              ...item.metadata,
              text: item.text,
              length: item.text.length,
              timestamp: new Date().toISOString()
            }
          };
        })
      );
      
      // Upsert batch to Pinecone
      await index.upsert(vectors);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('All knowledge upserted to Pinecone successfully');
    
  } catch (error) {
    console.error('Error upserting knowledge base:', error);
    throw error;
  }
};

// Enhanced search with caching
export const searchKnowledgeBase = async (query, openai) => {
  try {
    // Check cache first
    const cachedResults = await cacheManager.getCachedSearchResults(query);
    if (cachedResults) {
      console.log('Using cached search results');
      return cachedResults;
    }

    const index = await initializePinecone();
    
    // Generate embedding for the query
    const queryEmbedding = await createEmbedding(query, openai);
    
    // Search Pinecone with higher topK for more comprehensive results
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 10, // Increased for more comprehensive knowledge
      includeMetadata: true,
    });
    
    // Extract and categorize relevant information
    const relevantChunks = searchResults.matches
      .filter(match => match.score > 0.6) // Slightly lower threshold for more results
      .map(match => ({
        text: match.metadata.text,
        score: match.score,
        source: match.metadata.source,
        chunkIndex: match.metadata.chunkIndex || 0
      }));

    // Group by source for better organization
    const groupedBySource = relevantChunks.reduce((acc, chunk) => {
      const source = chunk.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(chunk);
      return acc;
    }, {});

    // Create structured knowledge base response
    let structuredResult = '';
    
    Object.entries(groupedBySource).forEach(([source, chunks]) => {
      structuredResult += `\n=== FROM ${source.toUpperCase()} ===\n`;
      chunks
        .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0)) // Sort by chunk order
        .forEach(chunk => {
          structuredResult += `${chunk.text}\n\n`;
        });
    });

    // If we have relevant information, format it nicely
    const result = structuredResult.trim() || 'No specific information found in the knowledge base.';
    
    // Cache the results
    await cacheManager.cacheSearchResults(query, result);
    
    return result;
    
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return 'Error retrieving information from knowledge base.';
  }
};

// Initialize knowledge base (run this once to populate)
export const initializeKnowledgeBase = async (openai) => {
  try {
    console.log('Initializing comprehensive knowledge base...');
    
    // Initialize Pinecone and cache
    await initializePinecone();
    
    // Upsert all knowledge sources
    await upsertAllKnowledge(openai);
    
    console.log('Knowledge base initialization complete!');
    
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
    throw error;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const index = await initializePinecone();
    const stats = await index.describeIndexStats();
    const cacheHealth = await cacheManager.healthCheck();
    
    return {
      pinecone: {
        connected: true,
        totalVectors: stats.totalVectorCount,
        dimension: stats.dimension
      },
      cache: {
        connected: cacheHealth
      }
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      pinecone: { connected: false },
      cache: { connected: false }
    };
  }
};

export default { 
  initializePinecone, 
  upsertAllKnowledge, 
  searchKnowledgeBase, 
  initializeKnowledgeBase,
  healthCheck,
  createEmbedding
};
