import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const INDEX_NAME = "isaac-info";

// Initialize the index
export const initializePinecone = async () => {
  try {
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

// Prepare knowledge base for vector storage
export const prepareKnowledgeBase = () => {
  return [
    {
      id: 'about-me',
      text: `Isaac Mineo is a passionate Full-Stack Developer and AI Engineer who thrives on building useful, intelligent, and scalable web applications. He cares deeply about clean code, performance, and crafting digital tools that make real-world impact. Isaac specializes in backend architecture and AI integration. He's a problem solver who enjoys tackling complex technical challenges and values clean, maintainable code. Isaac is actively seeking backend, AI engineering, or full-stack roles where he can build meaningful tools alongside smart, creative teams. He's especially interested in opportunities with healthtech, AI, productivity, or developer tooling companies.`,
      metadata: { category: 'personal', type: 'about' }
    },
    {
      id: 'tech-stack-frontend',
      text: `Isaac's frontend skills include React 18 (expert level), JavaScript/TypeScript (advanced), Tailwind CSS (advanced), Vite, HTML5/CSS3, and responsive design. He's an expert in React hooks, context, state management, and building responsive, mobile-first applications with cross-browser compatibility.`,
      metadata: { category: 'skills', type: 'frontend' }
    },
    {
      id: 'tech-stack-backend',
      text: `Isaac's backend expertise includes FastAPI (expert level), Python (advanced), Node.js, RESTful API design, and database design. He specializes in building scalable backend systems, async programming, and clean API architecture with comprehensive documentation.`,
      metadata: { category: 'skills', type: 'backend' }
    },
    {
      id: 'tech-stack-ai',
      text: `Isaac has advanced experience with AI integration, particularly OpenAI API integration, Claude API, prompt engineering, and vector databases. He's skilled in building AI-powered applications and implementing smart features with automation. He's learning about Pinecone and embeddings for vector search.`,
      metadata: { category: 'skills', type: 'ai' }
    },
    {
      id: 'tech-stack-databases',
      text: `Isaac works with MongoDB (advanced), PostgreSQL, Redis for caching and session management, and Firebase Firestore for real-time databases. He's experienced in NoSQL and relational database design, schema optimization, and performance tuning.`,
      metadata: { category: 'skills', type: 'databases' }
    },
    {
      id: 'nutrivize-project',
      text: `Nutrivize is Isaac's flagship project - an intelligent nutrition tracking application that uses AI to automatically recognize foods from photos and provides personalized nutritional insights. Built with React 18, FastAPI, MongoDB, Firebase Auth, OpenAI GPT-4 Vision, and Redis Cloud. Features include AI-powered food photo recognition, personalized macro tracking, smart meal suggestions, social sharing, progress tracking, and offline functionality. The app is deployed on Vercel and Render and actively used by beta testers.`,
      metadata: { category: 'projects', type: 'flagship' }
    },
    {
      id: 'career-goals',
      text: `Isaac is looking for backend developer, AI engineer, or full-stack developer roles focusing on API development, AI integration, and scalable systems. He's excited about healthtech, AI/ML companies, productivity tools, developer tooling, EdTech, FinTech, and SaaS companies. He prefers startup environments (10-500 employees) with collaborative teams, remote-friendly work, strong engineering culture, and opportunities for continuous learning. Isaac values building meaningful technology that makes a positive impact.`,
      metadata: { category: 'career', type: 'goals' }
    },
    {
      id: 'contact-info',
      text: `Isaac can be reached at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, and LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing interesting opportunities and projects. He's available for remote work and open to relocation for the right opportunity.`,
      metadata: { category: 'contact', type: 'info' }
    }
  ];
};

// Function to upsert knowledge base to Pinecone
export const upsertKnowledgeBase = async (openai) => {
  try {
    const index = await initializePinecone();
    const knowledgeBase = prepareKnowledgeBase();
    
    // Generate embeddings for each piece of knowledge
    const vectors = await Promise.all(
      knowledgeBase.map(async (item) => {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: item.text,
        });
        
        return {
          id: item.id,
          values: embedding.data[0].embedding,
          metadata: {
            ...item.metadata,
            text: item.text
          }
        };
      })
    );
    
    // Upsert vectors to Pinecone
    await index.upsert(vectors);
    console.log('Knowledge base upserted to Pinecone successfully');
    
  } catch (error) {
    console.error('Error upserting knowledge base:', error);
    throw error;
  }
};

// Function to search knowledge base
export const searchKnowledgeBase = async (query, openai) => {
  try {
    const index = await initializePinecone();
    
    // Generate embedding for the query
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    
    // Search Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 3,
      includeMetadata: true,
    });
    
    // Extract relevant text from results
    const relevantInfo = searchResults.matches
      .filter(match => match.score > 0.7) // Only include high-confidence matches
      .map(match => match.metadata.text)
      .join('\n\n');
    
    return relevantInfo || 'No specific information found.';
    
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return 'Error retrieving information.';
  }
};

export default { initializePinecone, upsertKnowledgeBase, searchKnowledgeBase };
