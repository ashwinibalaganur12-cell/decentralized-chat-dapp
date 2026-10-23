import { useState, useEffect, useCallback } from 'react';
import { decryptMessage } from '../utils/encryption';

/**
 * Custom hook for listening to contract events in real-time
 * Automatically decrypts messages and filters events for current user
 */
export const useContractEvents = (contract, userAddress, currentFriend) => {
    const [newMessages, setNewMessages] = useState([]);
    const [friendUpdates, setFriendUpdates] = useState([]);
    const [accountUpdates, setAccountUpdates] = useState([]);

    // Handle new message events
    const handleMessageSent = useCallback((sender, recipient, encryptedContent, timestamp, event) => {
        console.log('📨 MessageSent event:', { sender, recipient, timestamp: Number(timestamp) });

        // Only process if message involves current user
        if (sender.toLowerCase() === userAddress?.toLowerCase() ||
            recipient.toLowerCase() === userAddress?.toLowerCase()) {

            // Determine the other party in the conversation
            const otherAddress = sender.toLowerCase() === userAddress?.toLowerCase()
                ? recipient
                : sender;

            // Only decrypt if this is the current conversation
            if (currentFriend && otherAddress.toLowerCase() === currentFriend.address?.toLowerCase()) {
                try {
                    const decrypted = decryptMessage(
                        encryptedContent,
                        userAddress,
                        otherAddress
                    );

                    const newMessage = {
                        sender,
                        recipient,
                        content: decrypted,
                        encryptedContent,
                        timestamp: Number(timestamp),
                        blockNumber: event.log.blockNumber,
                        transactionHash: event.log.transactionHash
                    };

                    setNewMessages(prev => [...prev, newMessage]);
                    console.log('✅ Message decrypted and added:', decrypted);
                } catch (error) {
                    console.error('Failed to decrypt message:', error);
                }
            }
        }
    }, [userAddress, currentFriend]);

    // Handle friend added events
    const handleFriendAdded = useCallback((user, friend, friendName, timestamp, event) => {
        console.log('👥 FriendAdded event:', { user, friend, friendName });

        if (user.toLowerCase() === userAddress?.toLowerCase()) {
            setFriendUpdates(prev => [...prev, {
                friend,
                friendName,
                timestamp: Number(timestamp),
                blockNumber: event.log.blockNumber
            }]);
        }
    }, [userAddress]);

    // Handle account created events
    const handleAccountCreated = useCallback((user, username, timestamp, event) => {
        console.log('👤 AccountCreated event:', { user, username });

        setAccountUpdates(prev => [...prev, {
            user,
            username,
            timestamp: Number(timestamp),
            blockNumber: event.log.blockNumber
        }]);
    }, []);

    // Set up event listeners
    useEffect(() => {
        if (!contract || !userAddress) {
            console.log('⏸️ Contract or userAddress not ready for events');
            return;
        }

        console.log('🎧 Setting up event listeners for:', userAddress);

        // Listen for MessageSent events
        contract.on('MessageSent', handleMessageSent);

        // Listen for FriendAdded events
        contract.on('FriendAdded', handleFriendAdded);

        // Listen for AccountCreated events
        contract.on('AccountCreated', handleAccountCreated);

        // Cleanup function
        return () => {
            console.log('🔇 Removing event listeners');
            contract.off('MessageSent', handleMessageSent);
            contract.off('FriendAdded', handleFriendAdded);
            contract.off('AccountCreated', handleAccountCreated);
        };
    }, [contract, userAddress, handleMessageSent, handleFriendAdded, handleAccountCreated]);

    // Clear new messages when friend changes
    useEffect(() => {
        setNewMessages([]);
    }, [currentFriend]);

    return {
        newMessages,
        friendUpdates,
        accountUpdates,
        clearMessages: () => setNewMessages([]),
        clearFriendUpdates: () => setFriendUpdates([]),
        clearAccountUpdates: () => setAccountUpdates([])
    };
};
