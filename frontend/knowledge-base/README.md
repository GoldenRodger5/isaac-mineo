# Isaac Mineo Portfolio - Knowledge Base

This directory contains all documents and content that get vectorized and indexed for the AI chatbot's semantic search functionality.

## Structure

```
knowledge-base/
├── documents/          # PDF documents to be processed
│   ├── isaac-mineo-resume.pdf
│   └── isaac-mineo-transcript.pdf
├── text-content/       # Text files with structured information
│   ├── about_me.txt
│   ├── career_goals.txt
│   ├── projects.txt
│   └── tech_stack.txt
└── README.md          # This file
```

## Document Types

### PDF Documents (`documents/`)
- **isaac-mineo-resume.pdf**: Professional resume with work experience, education, and skills
- **isaac-mineo-transcript.pdf**: Academic transcript from University of Iowa

### Text Content (`text-content/`)
- **about_me.txt**: Personal background, interests, and professional journey
- **tech_stack.txt**: Detailed technical skills, frameworks, and proficiency levels
- **projects.txt**: Featured projects with descriptions and technologies used
- **career_goals.txt**: Professional aspirations, career objectives, and interests

## Processing Workflow

1. **Initial Setup**: Run `scripts/setupVectorization.js` to process all files
2. **File Changes**: When you add/modify files, re-run the setup script
3. **Tracking**: The script automatically tracks file changes via MD5 hashes
4. **Indexing**: Content is chunked, embedded, and stored in Pinecone vector database

## Adding New Content

To add new content to the knowledge base:

1. **For PDFs**: Place them in the `documents/` folder
2. **For Text**: Place them in the `text-content/` folder
3. **Update the setup script**: Add the new file to the documents array in `setupVectorization.js`
4. **Re-run indexing**: Execute `node scripts/setupVectorization.js`

## Content Guidelines

- **Be Comprehensive**: Include detailed information for better search results
- **Use Clear Language**: Write in a way that's easy for AI to understand and extract
- **Stay Current**: Regularly update files to reflect latest information
- **Organize Logically**: Group related information together

## File Naming Convention

- Use lowercase with hyphens for consistency
- Be descriptive but concise
- Include context in the filename (e.g., `isaac-mineo-resume.pdf` vs `resume.pdf`)

## Cache Management

The vectorization process creates a `.processed-docs.json` file to track what's been indexed. This file:
- Stores MD5 hashes to detect file changes
- Tracks processing timestamps
- Prevents unnecessary re-processing of unchanged files
- Is automatically managed by the setup script

## Integration

This knowledge base powers:
- **Semantic Search**: Find relevant information based on user queries
- **AI Responses**: Provide contextual answers about Isaac's background
- **Chatbot Intelligence**: Enable natural conversations about Isaac's experience
- **Portfolio Showcase**: Highlight key information dynamically
