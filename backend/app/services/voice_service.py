import asyncio
import os
import json
import base64
import logging
from typing import Optional, AsyncGenerator, Callable, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class VoiceService:
    """
    Voice service handling real-time speech-to-text and text-to-speech
    with interruption capabilities for voice chat
    """
    
    def __init__(self):
        self.deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
        self.elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY") 
        self.elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Default voice
        
        # Initialize clients only if keys are available
        self.deepgram_client = None
        self.elevenlabs_client = None
        
        if self.deepgram_api_key:
            try:
                from deepgram import DeepgramClient
                self.deepgram_client = DeepgramClient(self.deepgram_api_key)
                logger.info("✅ Deepgram client initialized")
            except ImportError:
                logger.warning("Deepgram SDK not installed - voice transcription disabled")
        else:
            logger.warning("DEEPGRAM_API_KEY not found - voice transcription disabled")
        
        if self.elevenlabs_api_key:
            try:
                from elevenlabs import ElevenLabs
                self.elevenlabs_client = ElevenLabs(api_key=self.elevenlabs_api_key)
                logger.info("✅ ElevenLabs client initialized")
            except ImportError:
                logger.warning("ElevenLabs SDK not installed - voice synthesis disabled")
        else:
            logger.warning("ELEVENLABS_API_KEY not found - voice synthesis disabled")
            
        # Track active playback for interruption
        self.active_playback: Optional[asyncio.Task] = None
        
    def is_enabled(self) -> bool:
        """Check if voice services are properly configured"""
        return bool(self.deepgram_client and self.elevenlabs_client)
    
    def get_status(self) -> dict:
        """Get status of voice services"""
        return {
            "voice_enabled": self.is_enabled(),
            "deepgram_available": bool(self.deepgram_client),
            "elevenlabs_available": bool(self.elevenlabs_client),
            "deepgram_key_configured": bool(self.deepgram_api_key),
            "elevenlabs_key_configured": bool(self.elevenlabs_api_key)
        }
    
    async def start_live_transcription(self, websocket: WebSocket, on_transcript: Callable[[str], Any]):
        """
        Start live transcription using Deepgram WebSocket
        """
        if not self.deepgram_client:
            logger.error("Deepgram client not available")
            return None
            
        try:
            from deepgram import LiveTranscriptionEvents, LiveOptions
            
            # Configure live transcription options
            options = LiveOptions(
                model="nova-2",
                language="en-US",
                smart_format=True,
                interim_results=False,
                punctuate=True,
                filler_words=False,
                endpointing=300  # End utterance after 300ms of silence
            )
            
            # Create Deepgram connection
            dg_connection = self.deepgram_client.listen.websocket.v("1")
            
            def on_message(self, result, **kwargs):
                try:
                    sentence = result.channel.alternatives[0].transcript
                    if sentence and len(sentence.strip()) > 0:
                        logger.info(f"📝 Transcript: {sentence}")
                        asyncio.create_task(on_transcript(sentence))
                except Exception as e:
                    logger.error(f"Error processing transcript: {e}")
                    
            def on_error(self, error, **kwargs):
                logger.error(f"Deepgram error: {error}")
                
            def on_close(self, close, **kwargs):
                logger.info(f"Deepgram connection closed: {close}")
                
            def on_open(self, open, **kwargs):
                logger.info("Deepgram connection opened")
            
            # Set up event handlers
            dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
            dg_connection.on(LiveTranscriptionEvents.Error, on_error)
            dg_connection.on(LiveTranscriptionEvents.Close, on_close)
            dg_connection.on(LiveTranscriptionEvents.Open, on_open)
            
            # Start connection (this is synchronous, not async)
            start_result = dg_connection.start(options)
            if not start_result:
                logger.error("Failed to start Deepgram connection")
                return None
                
            logger.info("🎙️ Deepgram live transcription started")
            return dg_connection
            
        except Exception as e:
            logger.error(f"Failed to start live transcription: {e}")
            return None
    
    async def stop_current_playback(self):
        """Stop any currently playing audio (for barge-in functionality)"""
        if self.active_playback and not self.active_playback.done():
            logger.info("🛑 Interrupting current audio playback")
            self.active_playback.cancel()
            try:
                await self.active_playback
            except asyncio.CancelledError:
                pass
            self.active_playback = None
    
    async def stream_speech(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Convert text to speech using ElevenLabs streaming API
        Returns audio chunks that can be streamed to client
        """
        if not self.elevenlabs_client:
            logger.error("ElevenLabs client not available")
            return
            
        try:
            # Stop any current playback for barge-in
            await self.stop_current_playback()
            
            # Create streaming task
            async def stream_task():
                try:
                    logger.info(f"🔊 Starting TTS for: {text[:50]}...")
                    
                    # Use ElevenLabs streaming API
                    audio_stream = self.elevenlabs_client.generate(
                        text=text,
                        voice=self.elevenlabs_voice_id,
                        model="eleven_turbo_v2",
                        stream=True
                    )
                    
                    for chunk in audio_stream:
                        if chunk:
                            yield chunk
                            # Small delay to allow for interruption
                            await asyncio.sleep(0.01)
                            
                except asyncio.CancelledError:
                    logger.info("🛑 TTS stream cancelled (interrupted)")
                    raise
                except Exception as e:
                    logger.error(f"TTS streaming error: {e}")
                    
            # Yield audio chunks
            async for chunk in stream_task():
                yield chunk
                
        except Exception as e:
            logger.error(f"Failed to stream speech: {e}")
    
    async def synthesize_speech_url(self, text: str, timeout: int = 30) -> Optional[str]:
        """
        Generate speech and return a URL for playback (alternative to streaming)
        Uses async wrapper with timeout for better performance
        """
        if not self.elevenlabs_client:
            logger.error("ElevenLabs client not available")
            return None
            
        try:
            logger.info(f"🔊 Generating speech for: {text[:50]}...")
            
            # Wrap synchronous API call in async executor with timeout
            def generate_audio():
                audio_generator = self.elevenlabs_client.generate(
                    text=text,
                    voice=self.elevenlabs_voice_id,
                    model="eleven_turbo_v2"
                )
                # Collect all chunks from the generator
                audio_chunks = []
                for chunk in audio_generator:
                    audio_chunks.append(chunk)
                return b''.join(audio_chunks)
            
            # Run with timeout
            loop = asyncio.get_event_loop()
            audio_bytes = await asyncio.wait_for(
                loop.run_in_executor(None, generate_audio),
                timeout=timeout
            )
            
            # Convert to base64 for data URL
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            audio_url = f"data:audio/mpeg;base64,{audio_base64}"
            
            logger.info("✅ Speech generation complete")
            return audio_url
            
        except asyncio.TimeoutError:
            logger.error(f"Speech synthesis timed out after {timeout} seconds")
            return None
        except Exception as e:
            logger.error(f"Failed to synthesize speech: {e}")
            return None

# Global voice service instance
voice_service = VoiceService()
