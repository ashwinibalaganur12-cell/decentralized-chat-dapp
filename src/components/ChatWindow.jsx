import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Check, CheckCheck, Loader, Video, Phone } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import CallModal from './CallModal';
import './ChatWindow.css';

const ChatWindow = ({ activeChat, messages, onSendMessage, friendList }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [isVideoCall, setIsVideoCall] = useState(false); // Add this state
    const [callUrl, setCallUrl] = useState(null); // Add callUrl state
    const messagesEndRef = useRef(null);

    const inputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        // setShowEmojiPicker(false); // Keep open for multiple emojis
    };

    const fileInputRef = useRef(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleVideoCall = async () => {
        if (!activeChat) return;

        setIsVideoCall(true);
        setIsCallModalOpen(true);

        // Use a cryptographically strong random UUID to prevent 'unsafe room' warnings
        // and ensure privacy
        const roomId = `DAppSecure-${self.crypto.randomUUID()}`;
        // Append config to enable Prejoin page for safety (users verify before entering)
        // and disable third-party requests if possible
        // Video Call: Start with Video ON (default)
        const url = `https://meet.jit.si/${roomId}#config.prejoinPageEnabled=true`;
        setCallUrl(url);

        const callMessage = `📞 Started a PRIVATE video call.\nJoin here: ${url}`;

        // Send directly using the prop function
        if (!isSending) {
            setIsSending(true);
            try {
                await onSendMessage(callMessage);
                toast.success("Video call started!");
            } catch (e) {
                console.error(e);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleAudioCall = async () => {
        if (!activeChat) return;

        // Open custom call interface
        setIsVideoCall(false);
        setIsCallModalOpen(true);

        const roomId = `DAppAudio-${self.crypto.randomUUID()}`;
        // Config: Start with video muted (audio only mode preference)
        const url = `https://meet.jit.si/${roomId}#config.startWithVideoMuted=true&config.prejoinPageEnabled=true`;
        setCallUrl(url);

        const callMessage = `📞 Started a PRIVATE audio call.\nJoin here: ${url}`;

        if (!isSending) {
            setIsSending(true);
            try {
                // Send the link in the background so the other user can join
                await onSendMessage(callMessage);
                // toast.success("Audio call started!"); 
            } catch (e) {
                console.error(e);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Determine constraints based on type
        const isImage = file.type.startsWith('image/');

        // Strict size limit for non-images (data stored on-chain!)
        // 50KB limit for text/docs to prevent block limit errors
        if (!isImage && file.size > 50 * 1024) {
            toast.error('File too large for on-chain storage. Max 50KB for documents.');
            return;
        }

        // 2MB limit for images (we compress them)
        if (isImage && file.size > 2 * 1024 * 1024) {
            toast.error('Image too large. Please select an image under 2MB.');
            return;
        }

        const readFileAsBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });
        };

        const compressImage = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 150;
                        const MAX_HEIGHT = 150;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.5));
                    };
                };
            });
        };

        try {
            const toastId = toast.loading('Processing file...');
            let contentToSend;

            if (isImage) {
                contentToSend = await compressImage(file);
            } else {
                // For non-images, send raw base64 (must be small!)
                contentToSend = await readFileAsBase64(file);
            }

            // Send as message
            await onSendMessage(contentToSend);
            toast.dismiss(toastId);
            toast.success('File sent!');
        } catch (err) {
            console.error(err);
            toast.dismiss();
            // App.jsx handles the specific error toast, so we just don't show success
        }

        // Reset input
        e.target.value = '';
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Simulate typing indicator
    useEffect(() => {
        if (messages.length > 0 && !messages[messages.length - 1].isOwn) {
            setIsTyping(true);
            const timer = setTimeout(() => setIsTyping(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() && !isSending) {
            setIsSending(true);

            // Call the send message callback
            try {
                await onSendMessage(newMessage);
                setNewMessage('');
            } catch (e) {
                // Error handled by App.jsx
                console.error("Failed to send message", e);
            }

            setIsSending(false);

            // Focus back on input
            inputRef.current?.focus();
        }
    };

    // Handle Enter key (Shift+Enter for new line)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    if (!activeChat) {
        return (
            <div className="chat-placeholder">
                <div className="placeholder-content">
                    <div className="placeholder-icon">💬</div>
                    <h2>Select a chat to start messaging</h2>
                    <p>Your messages are secure and decentralized.</p>
                    <p className="placeholder-hint">Built on Ethereum blockchain</p>
                </div>
            </div>
        );
    }

    const messageCount = messages.length;
    const characterCount = newMessage.length;
    const maxChars = 500;

    return (
        <div className="chat-window">
            {/* Chat Header */}
            <div className="chat-header glass-panel">
                <div className="chat-header-info">
                    <div className="header-avatar">
                        {activeChat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="header-details">
                        <h3>{activeChat.name}</h3>
                        <span className="status-indicator">
                            {activeChat.type === 'group'
                                ? `${activeChat.members?.length || 0} members`
                                : 'Online'}
                        </span>
                    </div>
                </div>
                <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="icon-btn"
                        onClick={handleAudioCall}
                        title="Start Audio Call"
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        className="icon-btn"
                        onClick={handleVideoCall}
                        title="Start Video Call"
                    >
                        <Video size={20} />
                    </button>
                    {activeChat.type === 'group' ? (
                        <div className="group-badges">
                            <span className="badge">Group</span>
                        </div>
                    ) : (
                        <span className="message-count">{messageCount} msgs</span>
                    )}
                </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation! 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Resolve sender name
                        let senderName = "Unknown";
                        if (msg.isOwn) {
                            senderName = "You";
                        } else if (activeChat.type === 'group') {
                            // Try to find in group members or friend list
                            // In a real app, we'd have a member list with names. 
                            // For now, check friend list or use address
                            const friend = friendList?.find(f => f.address.toLowerCase() === msg.senderAddress?.toLowerCase());
                            senderName = friend ? friend.name : `${msg.senderAddress?.slice(0, 6)}...${msg.senderAddress?.slice(-4)}`;
                        } else {
                            // 1:1 Chat
                            senderName = activeChat.name;
                        }

                        return (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwn={msg.isOwn}
                                isGroup={activeChat.type === 'group'}
                                senderAddress={msg.senderAddress}
                                senderName={senderName}
                                isFirst={index === 0 || messages[index - 1].isOwn !== msg.isOwn}
                                isLast={index === messages.length - 1 || messages[index + 1]?.isOwn !== msg.isOwn}
                            />
                        );
                    })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="typing-indicator-wrapper">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area glass-panel">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="*"
                    style={{ display: 'none' }}
                />
                <form onSubmit={handleSend} className="input-form">
                    <div className="input-controls">
                        <button
                            type="button"
                            className="icon-btn"
                            title="Attach file"
                            aria-label="Attach file"
                            onClick={handleFileClick}
                        >
                            <Paperclip size={20} />
                        </button>

                        <div className="emoji-picker-container">
                            <button
                                type="button"
                                className={`icon-btn ${showEmojiPicker ? 'active' : ''}`}
                                title="Add emoji"
                                aria-label="Add emoji"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile size={20} />
                            </button>
                            {showEmojiPicker && (
                                <div className="emoji-picker-popup">
                                    <div className="emoji-picker-overlay" onClick={() => setShowEmojiPicker(false)} />
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        theme="dark"
                                        width={300}
                                        height={400}
                                        searchDisabled={false}
                                        skinTonesDisabled
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message... (Shift+Enter for new line)"
                            className="message-input"
                            rows={1}
                            maxLength={maxChars}
                            disabled={isSending}
                        />
                        {characterCount > 0 && (
                            <div className={`char-count ${characterCount > maxChars * 0.9 ? 'warning' : ''}`}>
                                {characterCount}/{maxChars}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`send-btn ${isSending ? 'sending' : ''}`}
                        disabled={newMessage.trim().length === 0 || isSending}
                        title="Send message"
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <Loader size={20} className="spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </form>
            </div>

            <CallModal
                isOpen={isCallModalOpen}
                contact={activeChat}
                onEndCall={() => setIsCallModalOpen(false)}
                isVideoCall={isVideoCall}
                callUrl={callUrl}
            />
        </div>
    );
};

export default ChatWindow;
