import React from 'react';
import { X, User, Shield, Github } from 'lucide-react';
import { formatAddress } from '../utils/errorHandler';

const SettingsModal = ({ walletInfo, username, onClose }) => {
    if (!walletInfo) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Profile Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <User size={18} />
                            <h3>Profile</h3>
                        </div>
                        <div className="profile-card">
                            <div className="profile-avatar-large">
                                {username ? username.charAt(0).toUpperCase() : <User size={32} />}
                            </div>
                            <div className="profile-info">
                                <span className="label">Name</span>
                                <span className="value">{username || "Not Registered"}</span>
                                <span className="label">Address</span>
                                <span className="value address">{formatAddress(walletInfo.address)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="settings-section">
                        <div className="section-header">
                            <Shield size={18} />
                            <h3>Security</h3>
                        </div>
                        <div className="setting-item">
                            <span>End-to-End Encryption</span>
                            <span className="status-badge active">Active</span>
                        </div>
                        <div className="setting-item">
                            <span>Network</span>
                            <span className="status-badge">Localhost</span>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="settings-section">
                        <div className="section-header">
                            <Github size={18} />
                            <h3>App Info</h3>
                        </div>
                        <div className="setting-item">
                            <span>Version</span>
                            <span className="text-muted">v1.0.0 (Beta)</span>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .settings-section {
                    margin-bottom: 1.5rem;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    color: var(--accent-primary);
                }
                .section-header h3 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin: 0;
                }
                .profile-card {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .profile-avatar-large {
                    width: 60px;
                    height: 60px;
                    background: var(--accent-gradient);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                }
                .profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .value {
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .value.address {
                    font-family: monospace;
                    font-size: 0.85rem;
                    color: var(--accent-secondary);
                }
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .setting-item:last-child {
                    border-bottom: none;
                }
                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-secondary);
                }
                .status-badge.active {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }
                .text-muted {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }
            `}</style>
        </div>
    );
};

export default SettingsModal;
