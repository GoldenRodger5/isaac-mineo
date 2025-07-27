🎙️ EchoPodCastGenerator

An intelligent AI-powered podcast generator that automatically transforms web content into engaging, conversation-style podcasts. Simply provide URLs, and the system will create a professional-sounding podcast complete with realistic voices and natural dialogue.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://echopodcastgenerator-frontend.onrender.com)

## 📋 Overview

EchoPodCastGenerator leverages cutting-edge AI technologies to analyze web content and transform it into dynamic, engaging podcasts. The system extracts key information from provided URLs, structures it into a conversational format, and generates human-like speech using advanced text-to-speech models.

### ✨ Key Features

- **URL-to-Podcast Conversion**: Transform any web article, blog post, or webpage into a podcast
- **Multi-Voice Conversations**: Generate natural-sounding dialogues between different voice personalities
- **Customizable Output**: Control podcast name, tagline, conversation style, and more
- **Creativity Controls**: Adjust AI creativity levels from factual to more inventive content
- **Voice Selection**: Choose from a variety of realistic AI voices for both questions and answers
- **Longform Mode**: Generate extended podcast episodes for deeper content exploration
- **Dark/Light Mode**: UI theme options for comfortable viewing in any environment
- **Responsive Design**: Works on both desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance, Python-based API framework
- **WebSockets**: Real-time status updates during podcast generation
- **OpenAI**: AI content generation and text-to-speech conversion
- **ElevenLabs**: High-quality, realistic voice synthesis
- **Pydub**: Audio processing and manipulation
- **YAML**: Configuration management for podcast settings

### Frontend
- **React**: Component-based UI library for interactive experiences
- **CSS3**: Modern styling with flexbox and CSS variables
- **WebSockets**: Real-time updates from backend processing
- **Fetch API**: Asynchronous HTTP requests to the backend

## 📂 Project Structure

```
ai-podcast/
├── frontend/                # React Frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── App.js           # Main application component
│   │   ├── App.css          # Application styles
│   │   ├── index.js         # Entry point
│   ├── package.json         # NPM dependencies
│
├── generated_podcasts/      # Output directory for MP3 files
├── .env                     # Environment variables
├── work.py                  # FastAPI backend implementation
├── config.yaml              # Configuration for podcast generation
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

## 💡 Detailed Features

### Podcast Customization
The application offers both basic and advanced customization options:

- **Basic Mode**: Simply enter URLs and generate a podcast with default settings
- **Advanced Mode**: Access detailed controls including:
  - **Podcast Name & Tagline**: Personalize your podcast's branding
  - **Creativity Level**: Slider control (0.0-1.0) to adjust AI creativity
  - **Longform Mode**: Toggle for extended podcast episodes
  - **Conversation Style**: Multiple options including Engaging, Fast-Paced, Enthusiastic, Casual, Analytical, Aggressive, Conversational, Intimate, and Humorous
  - **TTS Model**: Select from different text-to-speech engines (Open AI, Eleven Labs, etc.)
  - **Voice Selection**: Choose specific voices for questions and answers

### How It Works

1. **URL Submission**: User submits one or more URLs containing content they want to convert
2. **Content Analysis**: Backend system extracts and analyzes the key information
3. **Conversation Generation**: AI structures the content into a natural-sounding dialogue
4. **Voice Synthesis**: Text is converted to speech using selected voices
5. **Audio Processing**: The system combines all audio elements into a cohesive podcast
6. **Delivery**: Final podcast is made available for streaming and downloading

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key
- ElevenLabs API key

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/GoldenRodger5/EchoPodCastGenerator.git
cd EchoPodCastGenerator
```

2. Create a `.env` file with your API keys:
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
REACT_APP_API_URL=http://localhost:8000  # For local development
```

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
python -m uvicorn work:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install NPM dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open http://localhost:3000 in your browser

## 🌐 Deployment

The application is deployed using Render:

- **Frontend**: https://echopodcastgenerator-frontend.onrender.com
- **Backend**: https://ai-podcast-1.onrender.com

## 🧠 Technical Implementation

### Backend Architecture

The backend uses FastAPI to provide a robust API for podcast generation. Key components include:

- **WebSocket Connection**: Real-time status updates during generation
- **Background Tasks**: Asynchronous processing for podcast creation
- **Error Handling**: Comprehensive error management
- **CORS Support**: Cross-origin resource sharing for frontend communication
- **File Serving**: Direct access to generated podcast files

### Frontend Design

The React frontend provides an intuitive interface with:

- **Component Structure**: Modular design for maintainability
- **State Management**: React hooks for application state
- **Dynamic UI**: Conditional rendering based on selected options
- **Real-time Updates**: WebSocket connection for process status
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for AI and TTS technology
- [ElevenLabs](https://elevenlabs.io/) for voice synthesis
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend library
- [Render](https://render.com/) for hosting services