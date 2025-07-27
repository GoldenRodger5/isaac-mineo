# AI Chatbot Setup Instructions

## 📋 Overview

This AI chatbot integration allows visitors to ask questions about Isaac's experience, projects, tech stack, and career goals. It uses OpenAI's GPT API with optional Pinecone vector database for enhanced context retrieval.

## 🔧 Setup Options

### Option 1: Basic Setup (OpenAI only)
Simple implementation using OpenAI with pre-defined knowledge base.

### Option 2: Enhanced Setup (OpenAI + Pinecone)
Advanced implementation with vector search for more accurate, context-aware responses.

## 🚀 Basic Setup

### 1. Install Dependencies

```bash
npm install openai
```

### 2. Environment Variables

Add to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. API Endpoint

The basic chatbot API is already created at `/api/chatbot.js`. It uses the knowledge base files in `/src/data/knowledge-base/`.

### 4. Test the Integration

The chatbot component is already integrated into your App.jsx. Test it by:

1. Starting your development server
2. Clicking the chat icon in the bottom-right corner
3. Asking questions like:
   - "What's Isaac's strongest technology?"
   - "Tell me about Nutrivize"
   - "What kind of roles is he looking for?"

## 🚀 Enhanced Setup (Pinecone Integration)

### 1. Install Additional Dependencies

```bash
npm install @pinecone-database/pinecone
```

### 2. Environment Variables

Add to your `.env.local` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=pcsk_46LhaC_25PXrKkiC9uNVsJfBw7UV1meZLVmsobqWZwUzSz7ckeuiNioyY71RyXeazyAUpQ
```

### 3. Initialize Pinecone Index

Run this setup script once to create and populate your Pinecone index:

```javascript
// setup-pinecone.js
import { upsertKnowledgeBase } from './src/utils/pinecone.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function setupPinecone() {
  try {
    await upsertKnowledgeBase(openai);
    console.log('Pinecone setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupPinecone();
```

### 4. Use Enhanced API

Update the chatbot component to use `/api/chatbot-enhanced.js` instead of the basic version.

## 🎯 Sample Questions for Testing

### Technical Skills
- "What programming languages does Isaac know?"
- "Has Isaac worked with React?"
- "Tell me about Isaac's AI experience"
- "What databases does Isaac use?"

### Projects
- "What is Nutrivize?"
- "How does the food recognition work?"
- "What technologies were used in Nutrivize?"
- "Show me Isaac's projects"

### Career & Background
- "What kind of jobs is Isaac looking for?"
- "What's Isaac's experience level?"
- "Is Isaac open to remote work?"
- "What companies interest Isaac?"

### Contact
- "How can I contact Isaac?"
- "What's Isaac's email?"
- "Where can I see Isaac's code?"

## 🔧 Customization Options

### 1. Modify Knowledge Base

Update the files in `/src/data/knowledge-base/` to change the information the chatbot can access:

- `about_me.txt` - Personal background and approach
- `tech_stack.txt` - Technical skills and tools
- `projects.txt` - Project details and achievements
- `career_goals.txt` - Job preferences and career objectives

### 2. Adjust Response Style

Modify the system prompt in the API files to change how the AI responds:

```javascript
const systemPrompt = `You are Isaac's helpful and enthusiastic AI assistant...`;
```

### 3. Add New Categories

Create new knowledge base files and update the Pinecone preparation function to include additional topics.

### 4. Rate Limiting

For production, implement proper rate limiting:

```javascript
// Example with Redis
import redis from 'redis';

const client = redis.createClient();

// Check rate limit before processing
const userKey = `chatbot:${userIP}`;
const requestCount = await client.incr(userKey);
if (requestCount === 1) {
  await client.expire(userKey, 60); // 1 minute window
}
if (requestCount > 10) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

## 📊 Monitoring & Analytics

### 1. Track Popular Questions

Log questions to analyze what visitors are most interested in:

```javascript
// In your API handler
console.log('Question asked:', {
  question,
  timestamp: new Date(),
  userIP
});
```

### 2. Response Quality

Monitor response accuracy and user satisfaction to improve the knowledge base.

### 3. Performance Metrics

Track API response times and error rates for optimization.

## 🚀 Deployment Considerations

### 1. Vercel Functions

The API endpoints work as Vercel serverless functions. Make sure to:

- Set environment variables in Vercel dashboard
- Keep function execution time under limits
- Monitor cold start performance

### 2. Error Handling

The chatbot includes graceful fallbacks:

- If OpenAI API fails → Use predefined responses
- If Pinecone fails → Fall back to basic OpenAI
- If all APIs fail → Show contact information

### 3. Security

- Environment variables are properly secured
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- CORS headers configured for your domain

## 💡 Advanced Features to Consider

### 1. Conversation Memory

Store conversation context for follow-up questions:

```javascript
const conversationHistory = [
  { role: "user", content: previousQuestion },
  { role: "assistant", content: previousResponse },
  { role: "user", content: currentQuestion }
];
```

### 2. Suggested Questions

Dynamically generate follow-up questions based on the current conversation.

### 3. Analytics Integration

Track chatbot usage with Google Analytics or similar tools.

### 4. A/B Testing

Test different response styles or UI variations to optimize engagement.

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure environment variables are set correctly
2. **Rate Limits**: Implement proper rate limiting for production use
3. **Response Quality**: Update knowledge base files for better accuracy
4. **Performance**: Consider caching responses for common questions

### Debug Mode

Add debug logging to track issues:

```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', { question, relevantInfo, response });
}
```

---

The AI chatbot is now ready to showcase Isaac's expertise and help visitors learn about his skills, projects, and career goals in an interactive way!
