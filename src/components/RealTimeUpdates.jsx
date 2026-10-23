import { useEffect } from 'react';
import { decryptMessage } from '../utils/encryption';
import { useChatContract } from '../hooks/useChatContract';
import toast from 'react-hot-toast';

const RealTimeUpdates = ({ walletInfo, activeChat, onNewMessage }) => {
    const { wsContract, contract } = useChatContract(walletInfo?.signer);

    useEffect(() => {
        // Use WebSocket contract if available (better for events), otherwise standard contract
        const listeningContract = wsContract || contract;

        if (!listeningContract || !activeChat || !walletInfo) return;

        console.log("🎧 Starting real-time listener for", activeChat.name);

        const handleMessage = async (sender, recipient, encryptedContent, timestamp) => {
            // Check if this message is part of the active conversation
            // Case 1: Friend sent it to Me
            // Case 2: I sent it to Friend (and want to see it immediately)

            const isFromFriend = sender.toLowerCase() === activeChat.address.toLowerCase() &&
                recipient.toLowerCase() === walletInfo.address.toLowerCase();

            const isFromMe = sender.toLowerCase() === walletInfo.address.toLowerCase() &&
                recipient.toLowerCase() === activeChat.address.toLowerCase();

            if (isFromFriend || isFromMe) {
                console.log("📨 New real-time message detected!");

                try {
                    const decrypted = decryptMessage(encryptedContent, walletInfo.address, activeChat.address);

                    const newMessage = {
                        id: Date.now(), // Temporary ID until reload
                        content: decrypted,
                        timestamp: Number(timestamp) * 1000,
                        isOwn: isFromMe,
                        sent: true,
                        delivered: true,
                        read: true
                    };

                    onNewMessage(newMessage);

                    if (isFromFriend) {
                        const audio = new Audio('/assets/notification.mp3'); // Ensure this exists or catch error
                        audio.play().catch(() => { }); // Ignore play errors
                    }

                } catch (err) {
                    console.error("Failed to process real-time message:", err);
                }
            }
        };

        // Listen for ANY message sent
        // Note: Filters might be better for performance but raw listener is fine for local dev
        listeningContract.on("MessageSent", handleMessage);

        return () => {
            console.log("🛑 Stopping listener");
            listeningContract.off("MessageSent", handleMessage);
        };
    }, [wsContract, contract, activeChat, walletInfo, onNewMessage]);

    return null; // Headless component
};

export default RealTimeUpdates;
