import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for WebSocket provider
 * Provides real-time connection to blockchain for event listening
 */
export const useWebSocketProvider = () => {
    const [provider, setProvider] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let wsProvider = null;

        const connectWebSocket = async () => {
            try {
                // Determine WebSocket URL based on environment
                const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8545';

                console.log('🔌 Connecting to WebSocket:', wsUrl);

                // Create WebSocket provider
                wsProvider = new ethers.WebSocketProvider(wsUrl);

                // Wait for connection
                await wsProvider.ready;

                setProvider(wsProvider);
                setIsConnected(true);
                setError(null);

                console.log('✅ WebSocket connected');

                // Handle connection errors
                wsProvider.on('error', (err) => {
                    console.error('WebSocket error:', err);
                    setError(err.message);
                    setIsConnected(false);
                });

                // Handle disconnection
                wsProvider.on('close', () => {
                    console.warn('⚠️ WebSocket disconnected');
                    setIsConnected(false);
                });

            } catch (err) {
                console.error('Failed to connect WebSocket:', err);
                setError(err.message);
                setIsConnected(false);
            }
        };

        connectWebSocket();

        // Cleanup on unmount
        return () => {
            if (wsProvider) {
                console.log('🔌 Disconnecting WebSocket');
                wsProvider.destroy();
            }
        };
    }, []);

    return {
        provider,
        isConnected,
        error
    };
};
