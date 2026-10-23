import React from 'react';
import { Check, CheckCheck, FileText, Copy } from 'lucide-react'; // Added Copy
import toast from 'react-hot-toast'; // Added toast
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn, isFirst, isLast, senderName }) => {
    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // If less than 1 minute ago
        if (diff < 60000) {
            return 'Just now';
        }

        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // If yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Otherwise show date and time
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className={`message-wrapper ${isOwn ? 'own' : 'other'} ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}>
            <div className="message-bubble">
                {!isOwn && senderName && (
                    <div className="sender-name">{senderName}</div>
                )}
                <div className="message-content">
                    {(() => {
                        // Check for Base64 image
                        // use trim() to handle any potential whitespace
                        const trimmedContent = message.content ? message.content.trim() : '';

                        if (trimmedContent.startsWith('data:image')) {
                            return (
                                <div className="message-image-container">
                                    <img
                                        src={trimmedContent}
                                        alt="Shared photo"
                                        className="message-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/200x200?text=Broken+Image";
                                            e.target.alt = "Failed to load image";
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const w = window.open("");
                                            if (w) w.document.write('<img src="' + trimmedContent + '" style="max-width:100%"/>');
                                        }}
                                    />
                                </div>
                            );
                        } else if (trimmedContent.startsWith('data:')) {
                            // Handle other file types (PDF, txt, etc.)
                            return (
                                <div className="message-file-container">
                                    <a href={trimmedContent} download="SharedFile" className="file-download-link">
                                        <FileText size={24} />
                                        <span>Download File</span>
                                    </a>
                                </div>
                            );
                        }

                        // Regex to find URLs
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        // Regex to check if a URL is an image
                        const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

                        const parts = message.content.split(urlRegex);

                        return parts.map((part, i) => {
                            if (urlRegex.test(part)) {
                                if (imageRegex.test(part)) {
                                    return (
                                        <div key={i} className="message-image-container">
                                            <a href={part} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <img src={part} alt="Shared content" className="message-image" />
                                            </a>
                                        </div>
                                    );
                                } else if (part.includes('meet.jit.si')) {
                                    return (
                                        <div key={i} className="video-call-invite">
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <a href={part} target="_blank" rel="noopener noreferrer" className="join-call-btn" onClick={(e) => e.stopPropagation()}>
                                                    🎥 Join Video Call
                                                </a>
                                                <button
                                                    className="copy-link-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(part);
                                                    }}
                                                    title="Copy for WhatsApp/External"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: 'inherit'
                                                    }}
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'center' }}>
                                                🔒 Tip: Set a password inside for extra safety
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="message-link" onClick={(e) => e.stopPropagation()}>
                                            {part}
                                        </a>
                                    );
                                }
                            }
                            return part;
                        });
                    })()}
                </div>
                <div className="message-meta">
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    {isOwn && (
                        <span className="message-status">
                            {message.sent ? (
                                message.read ? (
                                    <CheckCheck size={14} className="status-icon read" />
                                ) : (
                                    <CheckCheck size={14} className="status-icon delivered" />
                                )
                            ) : (
                                <Check size={14} className="status-icon sent" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
