import React, { useState, useRef } from 'react';
import { X, Plus, CircleDashed, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusModal = ({ username, onClose }) => {
    const [myStatus, setMyStatus] = useState(null);
    const [statusImage, setStatusImage] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [tempStatus, setTempStatus] = useState("");

    const handleStartEditing = () => {
        setIsEditing(true);
        setTempStatus(myStatus || "");
    };

    const handleSaveStatus = (e) => {
        e?.stopPropagation();
        if (tempStatus.trim()) {
            setMyStatus(tempStatus);
            setStatusImage(null); // Clear image if text only
            setLastUpdated(new Date());
            toast.success("Status updated!");
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveStatus();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handlePhotoClick = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStatusImage(reader.result);
                setMyStatus("Photo Status");
                setLastUpdated(new Date());
                toast.success("Photo status updated!");
            };
            reader.readAsDataURL(file);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleViewStatus = () => {
        if (myStatus || statusImage) {
            setViewingStatus(true);
        } else {
            handleStartEditing();
        }
    };

    const [viewingStatus, setViewingStatus] = useState(false);

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content glass-panel" style={{ maxWidth: '400px', height: '80%' }}>
                    <div className="modal-header">
                        <h2>Status</h2>
                        <button onClick={onClose} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {/* My Status */}
                        <div className="status-section">
                            <div className="status-item main-status" onClick={handleViewStatus}>
                                <div className="status-avatar-container">
                                    <div className={`status-avatar ${myStatus ? 'has-status' : ''}`}>
                                        {statusImage ? (
                                            <img src={statusImage} alt="Status" className="status-img-preview" />
                                        ) : (
                                            username ? username.charAt(0).toUpperCase() : <CircleDashed size={24} />
                                        )}
                                    </div>
                                    <div className="plus-badge" onClick={(e) => { e.stopPropagation(); handlePhotoClick(e); }} title="Add Photo">
                                        <Camera size={12} strokeWidth={3} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="status-info" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>My Status</h4>
                                        {!isEditing && (
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => { e.stopPropagation(); handleStartEditing(); }}
                                                title="Edit Text Status"
                                            >
                                                <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                                                {/* Using rotated Plus as a simple 'Edit' pencil-ish substitute or just 'Plus' for add */}
                                                {/* Better yet, let's allow editing if it exists */}
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="status-input-wrapper" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="status-input"
                                                value={tempStatus}
                                                onChange={(e) => setTempStatus(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type your status..."
                                            />
                                        </div>
                                    ) : (
                                        <p>{myStatus ? myStatus : "Tap to add status update"}</p>
                                    )}
                                    {lastUpdated && !isEditing && <span className="time-hint">Today, {formatTime(lastUpdated)}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="divider-label">Recent updates</div>

                        {/* Empty State for Friends */}
                        <div className="no-status-updates">
                            <p className="text-muted">No recent updates from friends</p>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .status-section { margin-bottom: 1.5rem; }
                    .status-item {
                        display: flex; align-items: center; gap: 1rem; padding: 0.75rem;
                        cursor: pointer; transition: background 0.2s; border-radius: 0.5rem;
                    }
                    .status-item:hover { background: rgba(255, 255, 255, 0.05); }
                    .status-avatar-container { position: relative; }
                    .status-avatar {
                        width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary);
                        display: flex; align-items: center; justify-content: center;
                        font-weight: 600; color: var(--text-secondary); border: 2px solid transparent;
                    }
                    .status-avatar.has-status { border-color: #00a884; }
                    .status-img-preview { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
                    .plus-badge {
                        position: absolute; bottom: 0; right: 0; background: #00a884; color: white;
                        width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center;
                        justify-content: center; border: 2px solid var(--bg-secondary); cursor: pointer; z-index: 10;
                    }
                    .plus-badge:hover { transform: scale(1.1); }
                    .status-info h4 { margin: 0; font-size: 1rem; font-weight: 500; color: var(--text-primary); }
                    .status-info p { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--text-secondary); }
                    .divider-label { font-size: 0.85rem; color: var(--text-secondary); margin: 1rem 0.75rem; font-weight: 500; }
                    .status-input {
                        background: transparent; border: none; border-bottom: 2px solid #00a884;
                        color: white; width: 100%; padding: 4px 0; margin-top: 4px; outline: none; font-size: 0.9rem;
                    }
                    .icon-btn {
                        background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px;
                        display: flex; align-items: center; justify-content: center; border-radius: 50%;
                    }
                    .icon-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-primary); }

                    /* Story Viewer Overlay */
                    .story-overlay {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: #000; z-index: 3000; display: flex; flex-direction: column;
                        animation: fadeIn 0.3s ease;
                    }
                    .story-header {
                        display: flex; padding: 1rem; align-items: center; justify-content: space-between;
                        position: absolute; top: 0; width: 100%; z-index: 10; background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
                    }
                    .story-progress-bar {
                        position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.3);
                    }
                    .story-progress-fill {
                        height: 100%; background: white; width: 100%;
                        animation: progress 5s linear forwards; 
                    }
                    .story-content {
                        flex: 1; display: flex; align-items: center; justify-content: center; position: relative;
                    }
                    .story-image { max-width: 100%; max-height: 100%; object-fit: contain; }
                    .story-text {
                        font-size: 2rem; color: white; text-align: center; padding: 2rem; background: #00a884;
                        width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
                    }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes progress { from { width: 0%; } to { width: 100%; } }
                `}</style>
            </div>

            {/* Full Screen Story Viewer */}
            {viewingStatus && (
                <div className="story-overlay" onClick={() => setViewingStatus(false)}>
                    <div className="story-progress-bar">
                        <div className="story-progress-fill" onAnimationEnd={() => setViewingStatus(false)}></div>
                    </div>
                    <div className="story-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="status-avatar small">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: 'white', fontWeight: 500 }}>{username}</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                                {lastUpdated && formatTime(lastUpdated)}
                            </span>
                        </div>
                        <button onClick={() => setViewingStatus(false)} className="icon-btn">
                            <X size={24} color="white" />
                        </button>
                    </div>
                    <div className="story-content">
                        {statusImage ? (
                            <img src={statusImage} alt="Story" className="story-image" />
                        ) : (
                            <div className="story-text">
                                {myStatus}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default StatusModal;
