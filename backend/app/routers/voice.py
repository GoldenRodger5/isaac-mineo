from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import logging
from typing import Dict, Any, Optional
import base64

from app.services.voice_service import voice_service
from app.routers.chatbot import ChatRequest, ChatResponse, chat_with_assistant_core

logger = logging.getLogger(__name__)

router = APIRouter()

# Active voice sessions
active_sessions: Dict[str, Dict[str, Any]] = {}

class VoiceResponse(BaseModel):
    text: str
    audio_url: str
    session_id: str

class VoiceChatRequest(BaseModel):
    text: str
    session_id: str
    return_audio: bool = True

@router.get("/voice/status")
async def get_voice_status():
    """Get voice service status and configuration"""
    status = voice_service.get_status()
    return {
        "voice_enabled": status["voice_enabled"],
        "deepgram_available": status["deepgram_available"],
        "elevenlabs_available": status["elevenlabs_available"],
        "status": "Voice services ready" if status["voice_enabled"] else "Voice services need configuration"
    }

@router.post("/voice/synthesize", response_model=VoiceResponse)
async def synthesize_voice(request: VoiceChatRequest):
    """
    Convert text to speech and return audio URL
    Uses existing chat logic to generate AI response
    """
    try:
        # First get the AI response using existing chat logic
        chat_request = ChatRequest(
            question=request.text,
            sessionId=request.session_id
        )
        
        # Use the existing chat function
        chat_response = await chat_with_assistant_core(chat_request)
        
        if not request.return_audio:
            # Return just text response
            return VoiceResponse(
                text=chat_response.response,
                audio_url="",
                session_id=chat_response.sessionId
            )
        
        # Generate audio for the response
        audio_url = await voice_service.synthesize_speech_url(chat_response.response)
        
        if not audio_url:
            # Fallback to text-only if TTS fails
            return VoiceResponse(
                text=chat_response.response,
                audio_url="",
                session_id=chat_response.sessionId
            )
        
        return VoiceResponse(
            text=chat_response.response,
            audio_url=audio_url,
            session_id=chat_response.sessionId
        )
        
    except Exception as e:
        logger.error(f"Voice synthesis error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")

@router.websocket("/voice/chat")
async def voice_chat_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice chat
    Handles audio input/output with live transcription
    """
    await websocket.accept()
    session_id = None
    dg_connection = None
    
    try:
        logger.info("🎙️ Voice chat WebSocket connected")
        
        # Send initial status
        await websocket.send_json({
            "type": "status",
            "voice_enabled": voice_service.is_enabled(),
            "message": "Voice chat ready" if voice_service.is_enabled() else "Voice services not configured"
        })
        
        if not voice_service.is_enabled():
            await websocket.send_json({
                "type": "error",
                "message": "Voice services not available. Please configure API keys."
            })
            return
        
        async def handle_transcript(transcript: str):
            """Handle transcribed text and generate AI response"""
            nonlocal session_id  # Allow modification of session_id
            try:
                logger.info(f"🗣️ Processing transcript: {transcript}")
                
                # Stop any current audio playback for barge-in
                await voice_service.stop_current_playback()
                
                # Send transcript to client
                await websocket.send_json({
                    "type": "transcript",
                    "text": transcript
                })
                
                # Get AI response using existing chat logic
                chat_request = ChatRequest(
                    question=transcript,
                    sessionId=session_id
                )
                
                chat_response = await chat_with_assistant_core(chat_request)
                session_id = chat_response.sessionId  # Update session ID
                
                # Send text response
                await websocket.send_json({
                    "type": "ai_response",
                    "text": chat_response.response,
                    "session_id": session_id
                })
                
                # Generate and send audio
                audio_url = await voice_service.synthesize_speech_url(chat_response.response)
                if audio_url:
                    await websocket.send_json({
                        "type": "audio_response",
                        "audio_url": audio_url,
                        "text": chat_response.response
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Failed to generate audio response"
                    })
                    
            except Exception as e:
                logger.error(f"Error handling transcript: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Failed to process transcript: {str(e)}"
                })
        
        # Start live transcription
        dg_connection = await voice_service.start_live_transcription(
            websocket, 
            handle_transcript
        )
        
        if not dg_connection:
            await websocket.send_json({
                "type": "error",
                "message": "Failed to start live transcription"
            })
            return
        
        # Handle incoming messages
        while True:
            try:
                message = await websocket.receive()
                
                if message["type"] == "websocket.receive":
                    if "bytes" in message:
                        # Audio data from client
                        audio_data = message["bytes"]
                        if dg_connection:
                            await dg_connection.send(audio_data)
                    elif "text" in message:
                        # Text message from client
                        data = json.loads(message["text"])
                        
                        if data.get("type") == "start_session":
                            session_id = data.get("session_id")
                            logger.info(f"Voice session started: {session_id}")
                            
                        elif data.get("type") == "end_session":
                            logger.info("Voice session ended by client")
                            break
                            
                        elif data.get("type") == "interrupt":
                            # Handle barge-in - stop current audio
                            await voice_service.stop_current_playback()
                            await websocket.send_json({
                                "type": "interrupted",
                                "message": "Audio playback stopped"
                            })
                            
                elif message["type"] == "websocket.disconnect":
                    break
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket message error: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Message processing error: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info("Voice chat WebSocket disconnected")
    except Exception as e:
        logger.error(f"Voice chat WebSocket error: {e}")
    finally:
        # Cleanup
        if dg_connection:
            try:
                await dg_connection.finish()
            except:
                pass
        
        # Stop any active playback
        await voice_service.stop_current_playback()
        
        logger.info("Voice chat session cleanup complete")

@router.post("/voice/interrupt")
async def interrupt_audio():
    """Endpoint to interrupt current audio playback"""
    try:
        await voice_service.stop_current_playback()
        return {"status": "Audio playback interrupted"}
    except Exception as e:
        logger.error(f"Failed to interrupt audio: {e}")
        raise HTTPException(status_code=500, detail="Failed to interrupt audio")
