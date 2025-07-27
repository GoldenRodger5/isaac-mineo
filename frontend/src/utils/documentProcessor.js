import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Dynamic import for pdf-parse to avoid build issues
let pdfParse;
try {
  pdfParse = (await import('pdf-parse')).default;
} catch (error) {
  console.error('PDF parsing not available:', error.message);
}

/**
 * Document processor for extracting and chunking text from PDFs
 */
export class DocumentProcessor {
  constructor() {
    this.chunkSize = 1000; // Characters per chunk
    this.chunkOverlap = 200; // Overlap between chunks
  }

  /**
   * Extract text from PDF file
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractPDFText(filePath) {
    try {
      if (!pdfParse) {
        throw new Error('PDF parsing not available');
      }
      
      const dataBuffer = readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`Error extracting text from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Smart text chunking that preserves context
   * @param {string} text - Text to chunk
   * @param {Object} metadata - Metadata to attach to chunks
   * @returns {Array} Array of text chunks with metadata
   */
  chunkText(text, metadata = {}) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentLength = 0;

    for (const sentence of sentences) {
      const sentenceLength = sentence.trim().length;
      
      // If adding this sentence would exceed chunk size, finalize current chunk
      if (currentLength + sentenceLength > this.chunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            ...metadata,
            chunkIndex: chunks.length,
            length: currentLength
          }
        });

        // Start new chunk with overlap from previous chunk
        const overlapWords = currentChunk.split(' ').slice(-20).join(' ');
        currentChunk = overlapWords + ' ' + sentence.trim();
        currentLength = currentChunk.length;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
        currentLength = currentChunk.length;
      }
    }

    // Add final chunk if it exists
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          ...metadata,
          chunkIndex: chunks.length,
          length: currentLength
        }
      });
    }

    return chunks;
  }

  /**
   * Process resume PDF into categorized chunks
   * @param {string} resumePath - Path to resume PDF
   * @returns {Promise<Array>} Categorized resume chunks
   */
  async processResume(resumePath) {
    try {
      const text = await this.extractPDFText(resumePath);
      
      // Identify different sections based on common patterns
      const sections = this.categorizeResumeContent(text);
      const chunks = [];

      for (const [category, content] of Object.entries(sections)) {
        if (content.trim()) {
          const categoryChunks = this.chunkText(content, {
            source: 'resume',
            category: category,
            type: 'document'
          });
          chunks.push(...categoryChunks);
        }
      }

      return chunks;
    } catch (error) {
      console.error('Error processing resume:', error);
      return [];
    }
  }

  /**
   * Process transcript PDF into academic chunks
   * @param {string} transcriptPath - Path to transcript PDF
   * @returns {Promise<Array>} Academic transcript chunks
   */
  async processTranscript(transcriptPath) {
    try {
      const text = await this.extractPDFText(transcriptPath);
      
      const chunks = this.chunkText(text, {
        source: 'transcript',
        category: 'education',
        type: 'document'
      });

      return chunks;
    } catch (error) {
      console.error('Error processing transcript:', error);
      return [];
    }
  }

  /**
   * Categorize resume content into sections
   * @param {string} text - Resume text
   * @returns {Object} Categorized content
   */
  categorizeResumeContent(text) {
    const sections = {
      contact: '',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      projects: '',
      other: ''
    };

    // Split by common section headers (case insensitive)
    const sectionPatterns = {
      contact: /contact|phone|email|address|linkedin|github/i,
      summary: /summary|objective|profile|about/i,
      experience: /experience|employment|work|professional/i,
      education: /education|degree|university|college|school/i,
      skills: /skills|technologies|technical|competencies/i,
      projects: /projects|portfolio|work samples/i
    };

    // Simple section detection - can be enhanced
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let currentSection = 'other';

    for (const line of lines) {
      // Check if line is a section header
      let foundSection = false;
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line) && line.length < 50) { // Section headers are usually short
          currentSection = section;
          foundSection = true;
          break;
        }
      }

      if (!foundSection) {
        sections[currentSection] += line + '\n';
      }
    }

    return sections;
  }

  /**
   * Process all documents and return combined chunks
   * @returns {Promise<Array>} All document chunks
   */
  async processAllDocuments() {
    const publicPath = path.join(process.cwd(), 'public');
    const resumePaths = [
      path.join(publicPath, 'IsaacMineo_Resume.pdf'),
      path.join(publicPath, 'Mineo, Isaac, Resume.pdf')
    ];
    const transcriptPath = path.join(publicPath, 'Mineo, Isaac, Transcript.pdf');

    const allChunks = [];

    // Process resume (try both possible files)
    for (const resumePath of resumePaths) {
      if (existsSync(resumePath)) {
        console.log(`Processing resume: ${resumePath}`);
        const resumeChunks = await this.processResume(resumePath);
        allChunks.push(...resumeChunks);
        break; // Only process one resume file
      }
    }

    // Process transcript
    if (existsSync(transcriptPath)) {
      console.log(`Processing transcript: ${transcriptPath}`);
      const transcriptChunks = await this.processTranscript(transcriptPath);
      allChunks.push(...transcriptChunks);
    }

    console.log(`Processed ${allChunks.length} document chunks`);
    return allChunks;
  }
}

export default DocumentProcessor;
