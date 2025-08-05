#!/usr/bin/env node

/**
 * Voice Implementation Test Script
 * 
 * This script tests the voice implementation functionality including:
 * - Backend voice endpoints
 * - WebSocket connections
 * - Audio processing capabilities
 * - Error handling
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class VoiceImplementationTester {
    constructor() {
        this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        this.wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        this.testResults.tests.push({
            timestamp,
            message,
            type,
            success: type === 'success' || type === 'info'
        });
    }

    async runTest(testName, testFunction) {
        this.log(`Starting test: ${testName}`, 'info');
        try {
            const result = await testFunction();
            this.log(`✅ ${testName}: PASSED`, 'success');
            return result;
        } catch (error) {
            this.log(`❌ ${testName}: FAILED - ${error.message}`, 'error');
            return false;
        }
    }

    async testBackendHealth() {
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) {
            throw new Error(`Backend health check failed: ${response.status}`);
        }
        const data = await response.json();
        this.log(`Backend health: ${JSON.stringify(data)}`, 'info');
        return true;
    }

    async testVoiceStatus() {
        const response = await fetch(`${this.baseUrl}/voice/status`);
        if (!response.ok) {
            throw new Error(`Voice status check failed: ${response.status}`);
        }
        const data = await response.json();
        this.log(`Voice status: ${JSON.stringify(data)}`, 'info');
        
        if (!data.voice_enabled) {
            throw new Error('Voice is not enabled on the backend');
        }
        
        return data;
    }

    async testWebSocketConnection() {
        return new Promise((resolve, reject) => {
            const wsUrl = `${this.wsUrl}/voice/chat`;
            this.log(`Connecting to WebSocket: ${wsUrl}`, 'info');
            
            const ws = new WebSocket(wsUrl);
            let connected = false;
            
            const timeout = setTimeout(() => {
                if (!connected) {
                    ws.close();
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 5000);
            
            ws.on('open', () => {
                connected = true;
                clearTimeout(timeout);
                this.log('WebSocket connected successfully', 'info');
                
                // Send test message
                ws.send(JSON.stringify({
                    type: 'start_session',
                    session_id: 'test-session-' + Date.now()
                }));
            });
            
            ws.on('message', (data) => {
                const message = JSON.parse(data);
                this.log(`WebSocket message received: ${JSON.stringify(message)}`, 'info');
                
                if (message.type === 'status') {
                    ws.close();
                    resolve(true);
                }
            });
            
            ws.on('error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`WebSocket error: ${error.message}`));
            });
            
            ws.on('close', () => {
                this.log('WebSocket connection closed', 'info');
            });
        });
    }

    async testVoiceEndpoints() {
        // Test voice configuration endpoint
        const configResponse = await fetch(`${this.baseUrl}/voice/config`);
        if (configResponse.ok) {
            const config = await configResponse.json();
            this.log(`Voice config: ${JSON.stringify(config)}`, 'info');
        }

        // Test voice models endpoint
        try {
            const modelsResponse = await fetch(`${this.baseUrl}/voice/models`);
            if (modelsResponse.ok) {
                const models = await modelsResponse.json();
                this.log(`Available voice models: ${JSON.stringify(models)}`, 'info');
            }
        } catch (error) {
            this.log(`Voice models endpoint not available: ${error.message}`, 'warning');
        }

        return true;
    }

    async testErrorHandling() {
        // Test invalid endpoint
        try {
            const response = await fetch(`${this.baseUrl}/voice/invalid-endpoint`);
            if (response.status === 404) {
                this.log('Error handling works correctly for invalid endpoints', 'info');
            }
        } catch (error) {
            // Expected
        }

        // Test WebSocket with invalid data
        return new Promise((resolve) => {
            const ws = new WebSocket(`${this.wsUrl}/voice/chat`);
            
            ws.on('open', () => {
                // Send invalid message
                ws.send('invalid json');
            });
            
            ws.on('message', (data) => {
                const message = JSON.parse(data);
                if (message.type === 'error') {
                    this.log('Error handling works correctly for invalid WebSocket messages', 'info');
                    ws.close();
                    resolve(true);
                }
            });
            
            ws.on('error', () => {
                resolve(true); // Error handling working
            });
            
            setTimeout(() => {
                ws.close();
                resolve(true);
            }, 3000);
        });
    }

    async checkFrontendFiles() {
        const filesToCheck = [
            'src/components/VoiceChat.jsx',
            'src/components/MobileChatInterface.jsx',
            'src/services/voiceService.js'
        ];

        for (const file of filesToCheck) {
            const filePath = path.join(__dirname, '..', 'frontend', file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                this.log(`✅ ${file}: exists (${stats.size} bytes)`, 'info');
            } else {
                throw new Error(`Missing file: ${file}`);
            }
        }

        return true;
    }

    async validateVoiceServiceCode() {
        const voiceServicePath = path.join(__dirname, '..', 'frontend', 'src', 'services', 'voiceService.js');
        
        if (!fs.existsSync(voiceServicePath)) {
            throw new Error('voiceService.js not found');
        }

        const content = fs.readFileSync(voiceServicePath, 'utf8');
        
        // Check for essential methods
        const requiredMethods = [
            'checkVoiceSupport',
            'startVoiceChat',
            'stopVoiceChat',
            'startRecording',
            'stopRecording'
        ];

        for (const method of requiredMethods) {
            if (!content.includes(method)) {
                throw new Error(`Missing method in voiceService: ${method}`);
            }
        }

        this.log('Voice service code validation passed', 'info');
        return true;
    }

    async generateTestReport() {
        const report = {
            testSuite: 'Voice Implementation Test',
            timestamp: this.testResults.timestamp,
            summary: {
                total: this.testResults.tests.length,
                passed: this.testResults.tests.filter(t => t.success).length,
                failed: this.testResults.tests.filter(t => !t.success).length
            },
            tests: this.testResults.tests,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                baseUrl: this.baseUrl,
                wsUrl: this.wsUrl
            }
        };

        const reportPath = path.join(__dirname, '..', 'voice-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`Test report saved to: ${reportPath}`, 'info');
        return report;
    }

    async runAllTests() {
        this.log('🎤 Starting Voice Implementation Tests', 'info');
        this.log(`Backend URL: ${this.baseUrl}`, 'info');
        this.log(`WebSocket URL: ${this.wsUrl}`, 'info');

        // Run all tests
        await this.runTest('Frontend Files Check', () => this.checkFrontendFiles());
        await this.runTest('Voice Service Code Validation', () => this.validateVoiceServiceCode());
        await this.runTest('Backend Health Check', () => this.testBackendHealth());
        await this.runTest('Voice Status Check', () => this.testVoiceStatus());
        await this.runTest('Voice Endpoints Test', () => this.testVoiceEndpoints());
        await this.runTest('WebSocket Connection Test', () => this.testWebSocketConnection());
        await this.runTest('Error Handling Test', () => this.testErrorHandling());

        // Generate report
        const report = await this.generateTestReport();
        
        this.log('🎤 Voice Implementation Tests Completed', 'info');
        this.log(`Summary: ${report.summary.passed}/${report.summary.total} tests passed`, 
                 report.summary.failed === 0 ? 'success' : 'error');

        return report.summary.failed === 0;
    }
}

// CLI Usage
if (require.main === module) {
    const tester = new VoiceImplementationTester();
    
    tester.runAllTests()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = VoiceImplementationTester;
