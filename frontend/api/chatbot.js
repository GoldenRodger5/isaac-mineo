import OpenAI from 'openai';
import { readFileSync } from 'fs';
import path from 'path';

// Initialize OpenAI client (you'll need to set OPENAI_API_KEY environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Load knowledge base files
const loadKnowledgeBase = () => {
  const knowledgeBasePath = path.join(process.cwd(), 'src/data/knowledge-base');
  const files = ['about_me.txt', 'tech_stack.txt', 'projects.txt', 'career_goals.txt'];
  
  let knowledgeBase = '';
  
  files.forEach(file => {
    try {
      const filePath = path.join(knowledgeBasePath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      knowledgeBase += `\n\n${content}`;
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  });
  
  return knowledgeBase;
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required and must be a string' });
    }

    // Rate limiting check (basic implementation)
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // In production, implement proper rate limiting with Redis or similar

    // Load the knowledge base
    const knowledgeBase = loadKnowledgeBase();

    // Create the system prompt
    const systemPrompt = `You are Isaac Mineo's AI assistant. Your job is to answer questions about Isaac based solely on the provided information. 

Key guidelines:
1. Only answer based on the provided knowledge base about Isaac
2. If you don't know something from the provided info, say "I don't have that specific information about Isaac"
3. Be conversational but professional
4. Keep responses concise but informative (2-3 sentences max)
5. If asked about contacting Isaac, provide his email: isaac@isaacmineo.com

Here's the knowledge base about Isaac:
${knowledgeBase}

Answer the user's question about Isaac based on this information.`;

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

    const response = completion.choices[0]?.message?.content || "I'm having trouble processing your question right now.";

    res.status(200).json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chatbot API:', error);
    
    // Don't expose internal errors to users
    res.status(500).json({ 
      error: "I'm having trouble connecting right now. Please try again or contact Isaac directly at isaac@isaacmineo.com" 
    });
  }
}
