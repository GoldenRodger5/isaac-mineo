import React, { useState, useEffect, useRef } from 'react';
import MobileChatInterface from '../components/MobileChatInterface';
import { voiceService } from '../services/voiceService';

const VoiceImplementationTest = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [sessionId] = useState(`test-session-${Date.now()}`);
  const [voiceStatus, setVoiceStatus] = useState('checking');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [testLog, setTestLog] = useState([]);

  const addToLog = (message, type = 'info') => {
    setTestLog(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  useEffect(() => {
    // Initialize test environment
    addToLog('Starting voice implementation test...', 'info');
    
    // Set up voice service monitoring
    voiceService.setOnStatusChange((status, enabled) => {
      setVoiceStatus(status);
      setIsVoiceEnabled(enabled);
      addToLog(`Voice status changed: ${status}, enabled: ${enabled}`, 'info');
    });

    voiceService.setOnError((error) => {
      addToLog(`Voice error: ${error}`, 'error');
    });

    voiceService.setOnTranscript((transcript) => {
      addToLog(`Transcript received: ${transcript}`, 'success');
    });

    voiceService.setOnResponse((text, audioUrl) => {
      addToLog(`Voice response received: ${text}, audio: ${!!audioUrl}`, 'success');
    });

    // Add initial welcome message
    setMessages([{
      id: 1,
      text: "Welcome to the Voice Implementation Test! This test will help verify all voice chat functionality.",
      isBot: true,
      timestamp: new Date()
    }]);

    runInitialTests();
  }, []);

  const runInitialTests = async () => {
    addToLog('Running initial voice tests...', 'info');
    
    // Test 1: Check voice support
    addToLog('Test 1: Checking voice support...', 'info');
    await voiceService.checkVoiceSupport();
    
    // Test 2: Check browser compatibility
    addToLog('Test 2: Checking browser compatibility...', 'info');
    const browserTests = {
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      webSocket: !!window.WebSocket,
      audioContext: !!(window.AudioContext || window.webkitAudioContext),
      mediaRecorder: !!window.MediaRecorder
    };
    
    Object.entries(browserTests).forEach(([feature, supported]) => {
      addToLog(`${feature}: ${supported ? 'SUPPORTED' : 'NOT SUPPORTED'}`, 
               supported ? 'success' : 'error');
    });

    setTestResults(prev => ({ ...prev, browserCompatibility: browserTests }));
  };

  const testMicrophonePermission = async () => {
    addToLog('Testing microphone permission...', 'info');
    try {
      const hasPermission = await voiceService.requestMicrophonePermission();
      addToLog(`Microphone permission: ${hasPermission ? 'GRANTED' : 'DENIED'}`, 
               hasPermission ? 'success' : 'error');
      return hasPermission;
    } catch (error) {
      addToLog(`Microphone test failed: ${error.message}`, 'error');
      return false;
    }
  };

  const testVoiceChatConnection = async () => {
    addToLog('Testing voice chat connection...', 'info');
    try {
      const success = await voiceService.startVoiceChat(sessionId);
      addToLog(`Voice chat connection: ${success ? 'SUCCESS' : 'FAILED'}`, 
               success ? 'success' : 'error');
      return success;
    } catch (error) {
      addToLog(`Voice chat connection failed: ${error.message}`, 'error');
      return false;
    }
  };

  const testRecordingFunctionality = () => {
    addToLog('Testing recording functionality...', 'info');
    
    // Test start recording
    voiceService.startRecording();
    addToLog('Started recording test', 'info');
    
    // Test stop recording after 3 seconds
    setTimeout(() => {
      voiceService.stopRecording();
      addToLog('Stopped recording test', 'info');
    }, 3000);
  };

  const simulateVoiceResponse = () => {
    addToLog('Simulating voice response...', 'info');
    
    const mockResponse = {
      text: "This is a test voice response. If you can hear this, the audio playback is working correctly.",
      audioUrl: null,
      isVoice: true,
      timestamp: new Date()
    };

    handleVoiceResponse(mockResponse);
  };

  const handleSendMessage = async (message) => {
    addToLog(`Message sent: ${message}`, 'info');
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: message,
      isBot: false,
      timestamp: new Date()
    }]);

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I received your message. Voice features are being tested.",
        "Thank you for testing the voice implementation. Everything seems to be working correctly.",
        "Voice test complete. The message was processed successfully.",
        "Testing voice functionality with your input: " + message
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        isBot: true,
        timestamp: new Date()
      }]);

      setIsLoading(false);
      addToLog(`AI response generated: ${response}`, 'success');
    }, 1500);
  };

  const handleVoiceResponse = (voiceData) => {
    addToLog(`Voice response handled: ${voiceData.text}`, 'success');
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: voiceData.text,
      isBot: true,
      timestamp: voiceData.timestamp,
      isVoice: true,
      audioUrl: voiceData.audioUrl
    }]);
  };

  const handleVoiceError = (error) => {
    addToLog(`Voice error occurred: ${error}`, 'error');
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: `Voice Error: ${error}`,
      isBot: true,
      timestamp: new Date(),
      isError: true
    }]);
  };

  const runFullVoiceTest = async () => {
    addToLog('Starting full voice test sequence...', 'info');
    
    // Step 1: Test microphone
    const micTest = await testMicrophonePermission();
    if (!micTest) {
      addToLog('Full test stopped: Microphone permission required', 'error');
      return;
    }

    // Step 2: Test connection
    const connectionTest = await testVoiceChatConnection();
    if (!connectionTest) {
      addToLog('Full test stopped: Voice chat connection failed', 'error');
      return;
    }

    // Step 3: Test recording
    addToLog('Starting recording test in 2 seconds...', 'info');
    setTimeout(() => {
      testRecordingFunctionality();
    }, 2000);

    addToLog('Full voice test sequence initiated', 'success');
  };

  const clearTestLog = () => {
    setTestLog([]);
    addToLog('Test log cleared', 'info');
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const suggestedQuestions = [
    "Test voice input",
    "Check microphone permission",
    "Simulate voice response"
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Test Panel */}
      <div className="w-1/3 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Voice Implementation Test</h2>
        
        {/* Voice Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Voice Status</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              voiceStatus === 'ready' ? 'bg-green-500' : 
              voiceStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            <span className="text-sm">{voiceStatus}</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Enabled: {isVoiceEnabled ? 'Yes' : 'No'}
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-2 mb-4">
          <button
            onClick={runFullVoiceTest}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Full Voice Test
          </button>
          
          <button
            onClick={testMicrophonePermission}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Microphone
          </button>
          
          <button
            onClick={testVoiceChatConnection}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Connection
          </button>
          
          <button
            onClick={testRecordingFunctionality}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Test Recording
          </button>
          
          <button
            onClick={simulateVoiceResponse}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Simulate Response
          </button>
        </div>

        {/* Test Log */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Test Log</h3>
            <button
              onClick={clearTestLog}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          
          <div className="h-64 overflow-y-auto space-y-1 text-xs">
            {testLog.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-400 mr-2">{log.timestamp}</span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <MobileChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          suggestedQuestions={suggestedQuestions}
          placeholder="Type a message to test voice functionality..."
          sessionId={sessionId}
          onVoiceResponse={handleVoiceResponse}
          onVoiceError={handleVoiceError}
        />
      </div>
    </div>
  );
};

export default VoiceImplementationTest;
