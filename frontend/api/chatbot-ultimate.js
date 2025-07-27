import OpenAI from 'openai';
import { searchKnowledgeBase } from '../src/utils/pineconeEnhanced.js';
import cacheManager from '../src/utils/cacheManager.js';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 60,      // requests per hour
  window: 3600       // 1 hour in seconds
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let sessionId = null;

  try {
    const { question, sessionId: clientSessionId } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required and must be a string' });
    }

    // Initialize cache manager
    await cacheManager.connect();

    // Rate limiting
    const userIP = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   'unknown';
    
    const requestCount = await cacheManager.incrementRateLimit(userIP, RATE_LIMIT.window);
    
    if (requestCount > RATE_LIMIT.requests) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: 3600
      });
    }

    // Session management
    sessionId = clientSessionId || uuidv4();
    let sessionData = await cacheManager.getSession(sessionId);
    
    if (!sessionData) {
      sessionData = { messages: [], lastUpdated: Date.now() };
    }

    // Check for cached response first
    const cachedResponse = await cacheManager.getCachedResponse(question);
    if (cachedResponse && Date.now() - new Date(cachedResponse.timestamp).getTime() < 1800000) { // 30 minutes
      // Update session with cached interaction
      sessionData.messages.push(
        { role: 'user', content: question, timestamp: Date.now() },
        { role: 'assistant', content: cachedResponse.response, timestamp: Date.now(), cached: true }
      );
      
      await cacheManager.cacheSession(sessionId, sessionData.messages);

      return res.status(200).json({ 
        response: cachedResponse.response,
        sessionId,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Search the enhanced knowledge base
    let relevantInfo;
    let searchSuccessful = false;
    
    try {
      relevantInfo = await searchKnowledgeBase(question, openai);
      searchSuccessful = true;
      console.log('Vector search successful');
    } catch (searchError) {
      console.log('Vector search failed, using fallback:', searchError.message);
      relevantInfo = getFallbackResponse(question);
    }

    // Build conversation context
    const recentMessages = sessionData.messages.slice(-6); // Last 3 exchanges
    const conversationContext = recentMessages.length > 0 ? 
      '\n\nRecent conversation context:\n' + 
      recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n') : '';

    // Create comprehensive prompt for GPT-4o
    const userPrompt = `KNOWLEDGE BASE INFORMATION ABOUT ISAAC MINEO:
${relevantInfo}

RECENT CONVERSATION CONTEXT:
${conversationContext}

USER QUESTION: ${question}

Please provide a helpful, professional, and engaging response about Isaac based on the knowledge base information above. Follow these guidelines:
1. Be conversational yet professional and enthusiastic about Isaac's capabilities
2. Use specific details from the knowledge base to support your answers
3. Connect Isaac's experience, skills, and projects to show his growth and expertise
4. If asked about something not in the knowledge base, clearly state that limitation
5. For contact inquiries, provide isaac@isaacmineo.com
6. Keep responses informative but digestible (2-4 sentences initially, offer to elaborate)
7. Reference specific technologies, projects, or experiences when relevant`;

    // Call OpenAI API with GPT-4o model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for excellent conversational AI
      messages: [
        { 
          role: "system", 
          content: "You are Isaac Mineo's AI assistant. Provide helpful, professional, and engaging responses about Isaac based on the comprehensive knowledge base information provided in the user message." 
        },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600, // Increased for more detailed responses
      temperature: 0.7, // Good balance of creativity and consistency
      presence_penalty: 0.1, // Encourage variety in responses
      frequency_penalty: 0.1 // Reduce repetition
    });

    const response = completion.choices[0]?.message?.content || 
      "I'm having trouble processing your question right now.";

    // Update session with new interaction
    sessionData.messages.push(
      { role: 'user', content: question, timestamp: Date.now() },
      { role: 'assistant', content: response, timestamp: Date.now() }
    );

    // Keep only last 20 messages to prevent session bloat
    if (sessionData.messages.length > 20) {
      sessionData.messages = sessionData.messages.slice(-20);
    }

    // Cache the session and response
    await cacheManager.cacheSession(sessionId, sessionData.messages);
    await cacheManager.cacheResponse(question, response, {
      searchSuccessful,
      sessionId,
      userIP: userIP.substring(0, 8) // Partial IP for analytics
    });

    // Return enhanced response
    res.status(200).json({ 
      response,
      sessionId,
      searchMethod: searchSuccessful ? 'vector_search' : 'fallback',
      conversationLength: sessionData.messages.length / 2,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in enhanced chatbot API:', error);
    
    // Fallback response with session tracking
    const fallbackResponse = getFallbackResponse(req.body.question || '');
    
    // Still try to update session even on error
    if (sessionId) {
      try {
        let sessionData = await cacheManager.getSession(sessionId) || { messages: [] };
        sessionData.messages.push(
          { role: 'user', content: req.body.question, timestamp: Date.now() },
          { role: 'assistant', content: fallbackResponse, timestamp: Date.now(), fallback: true }
        );
        await cacheManager.cacheSession(sessionId, sessionData.messages);
      } catch (sessionError) {
        console.error('Session update failed:', sessionError);
      }
    }
    
    res.status(200).json({ 
      response: fallbackResponse,
      sessionId: sessionId || uuidv4(),
      searchMethod: 'fallback',
      error: true,
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced fallback responses with more variety
function getFallbackResponse(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Tech stack questions
  if (lowerQuestion.includes('tech') || lowerQuestion.includes('stack') || lowerQuestion.includes('technologies')) {
    const techResponses = [
      "Isaac's main tech stack includes React, FastAPI, Python, MongoDB, and Redis. He specializes in AI integrations with OpenAI APIs and building scalable backend systems.",
      "Isaac works with React 18, FastAPI, Python, and MongoDB. He's particularly skilled with AI integration using OpenAI APIs and has experience with Redis for caching.",
      "On the tech side, Isaac's strongest with React, FastAPI, Python, and MongoDB. He loves building AI-powered applications and has deep experience with OpenAI's APIs."
    ];
    return techResponses[Math.floor(Math.random() * techResponses.length)];
  }
  
  // Project questions
  if (lowerQuestion.includes('nutrivize') || lowerQuestion.includes('project')) {
    return "Nutrivize is Isaac's flagship project - an AI-powered nutrition tracker using computer vision for food recognition. It's built with React, FastAPI, and integrates OpenAI's GPT-4 Vision for intelligent meal tracking.";
  }
  
  // Experience/background questions
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('background')) {
    return "Isaac is a Full-Stack Developer and AI Engineer specializing in intelligent, scalable web applications. He focuses on clean code, performance optimization, and building tools with real-world impact.";
  }
  
  // Job/career questions
  if (lowerQuestion.includes('looking for') || lowerQuestion.includes('job') || lowerQuestion.includes('career')) {
    return "Isaac is seeking backend, AI engineering, or full-stack roles with smart, creative teams. He's especially interested in healthtech, AI, productivity, or developer tooling companies.";
  }
  
  // AI questions
  if (lowerQuestion.includes('ai') || lowerQuestion.includes('artificial intelligence')) {
    return "Isaac has advanced AI integration experience, particularly with OpenAI APIs, prompt engineering, and building AI-powered features like Nutrivize's food recognition system.";
  }
  
  // Contact questions
  if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('reach')) {
    return "You can reach Isaac at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, or LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing opportunities!";
  }
  
  // Default response
  const defaultResponses = [
    "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaac@isaacmineo.com!",
    "I'd love to tell you more about Isaac! He's a skilled developer focused on AI integration and scalable backend systems. What specifically would you like to know about his background or projects?",
    "Isaac builds intelligent web applications using React, FastAPI, and AI. He's passionate about creating tools that make a real impact. What aspect of his work interests you most?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
