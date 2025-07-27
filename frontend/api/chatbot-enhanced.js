import OpenAI from 'openai';
import { searchKnowledgeBase } from '../src/utils/pinecone.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required and must be a string' });
    }

    // Basic rate limiting (in production, use Redis or similar)
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Search the vector database for relevant information
    let relevantInfo;
    try {
      relevantInfo = await searchKnowledgeBase(question, openai);
    } catch (pineconeError) {
      console.log('Pinecone search failed, using fallback responses');
      relevantInfo = getFallbackResponse(question);
    }

    // Create the system prompt with relevant information
    const systemPrompt = `You are Isaac Mineo's AI assistant. Answer questions about Isaac based on the provided information.

Guidelines:
1. Be conversational but professional
2. Keep responses concise (2-3 sentences)
3. If information isn't provided, say "I don't have that specific information about Isaac"
4. For contact questions, mention isaac@isaacmineo.com
5. Be enthusiastic about Isaac's skills and projects

Relevant information about Isaac:
${relevantInfo}

Answer the user's question based on this information.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 
      "I'm having trouble processing your question right now.";

    res.status(200).json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in enhanced chatbot API:', error);
    
    // Fallback response
    const fallbackResponse = getFallbackResponse(req.body.question || '');
    
    res.status(200).json({ 
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    });
  }
}

// Fallback responses when API fails
function getFallbackResponse(question) {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('tech') || lowerQuestion.includes('stack')) {
    return "Isaac's main tech stack includes React, FastAPI, Python, MongoDB, and Redis. He specializes in AI integrations with OpenAI APIs and building scalable backend systems.";
  }
  
  if (lowerQuestion.includes('nutrivize') || lowerQuestion.includes('project')) {
    return "Nutrivize is Isaac's flagship project - an AI-powered nutrition tracker using computer vision for food recognition. It's built with React, FastAPI, and integrates OpenAI's GPT-4 Vision.";
  }
  
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('background')) {
    return "Isaac is a Full-Stack Developer and AI Engineer specializing in intelligent, scalable web applications. He focuses on clean code, performance optimization, and real-world impact.";
  }
  
  if (lowerQuestion.includes('looking for') || lowerQuestion.includes('job')) {
    return "Isaac is seeking backend, AI engineering, or full-stack roles with smart, creative teams. He's especially interested in healthtech, AI, productivity, or developer tooling companies.";
  }
  
  if (lowerQuestion.includes('ai') || lowerQuestion.includes('artificial intelligence')) {
    return "Isaac has advanced AI integration experience, particularly with OpenAI APIs, prompt engineering, and building AI-powered features like Nutrivize's food recognition system.";
  }
  
  if (lowerQuestion.includes('contact') || lowerQuestion.includes('email')) {
    return "You can reach Isaac at isaac@isaacmineo.com, GitHub at github.com/GoldenRodger5, or LinkedIn at linkedin.com/in/isaacmineo. He's always open to discussing opportunities!";
  }
  
  return "Isaac is a Full-Stack Developer specializing in AI-powered applications. Ask me about his tech stack, projects like Nutrivize, experience, or career goals. Contact him at isaac@isaacmineo.com!";
}
