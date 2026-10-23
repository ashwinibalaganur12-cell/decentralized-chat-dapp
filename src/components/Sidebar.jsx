import React from 'react';
import { MessageSquare, Plus, LogOut, User, Users, CircleDashed, MessageSquarePlus, MoreVertical } from 'lucide-react';
import { formatAddress } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import './Sidebar.css';

const Sidebar = ({ account, username, friendList, groupList, activeChat, onSelectChat, onNewChat, onCreateGroup, onRegister, onLogout, onSettings, onStatus }) => {
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            // Default behavior: reload the page to disconnect
            window.location.reload();
        }
    };

    return (
        <div className="sidebar-content">
            <div className="sidebar-header">
                <div
                    className="user-avatar-header"
                    title={username ? username : "Click to Register"}
                    onClick={!username ? onRegister : undefined}
                >
                    <div className="user-avatar-circle">
                        {username ? username.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                </div>
                <div className="header-actions">

                    <button onClick={onNewChat} className="icon-btn" title="New Chat">
                        <MessageSquarePlus size={20} />
                    </button>
                    <button onClick={onCreateGroup} className="icon-btn" title="Create Group">
                        <Users size={20} />
                    </button>
                    <button className="icon-btn" title="Settings" onClick={onSettings}>
                        <MoreVertical size={20} />
                    </button>
                    <button className="icon-btn" title="Disconnect" onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="chat-list">
                {friendList && friendList.length > 0 ? (
                    friendList.map((friend) => (
                        <div
                            key={friend.id}
                            className={`chat-item ${activeChat === friend.id ? 'active' : ''}`}
                            onClick={() => onSelectChat(friend)}
                        >
                            <div className="chat-avatar">
                                {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="chat-info">
                                <div className="chat-name">{friend.name}</div>
                                <div className="chat-preview">
                                    {formatAddress(friend.address)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-friends">
                    </div>
                )}

                {/* GROUPS SECTION */}
                {groupList && groupList.length > 0 && (
                    <div className="section-header">Groups</div>
                )}

                {groupList && groupList.map((group) => (
                    <div
                        key={group.id}
                        className={`chat-item ${activeChat === group.id ? 'active' : ''}`}
                        onClick={() => onSelectChat(group)}
                    >
                        <div className="chat-avatar group-avatar">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="chat-info">
                            <div className="chat-name">{group.name}</div>
                            <div className="chat-preview">
                                {group.members?.length || 0} members
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / CTA */}
                {(!friendList?.length && !groupList?.length) && (
                    <div className="no-friends">
                        <p>No chats yet</p>
                        <button onClick={onNewChat} className="add-friend-cta">
                            <Plus size={16} />
                            Add Friend
                        </button>
                        <button onClick={onCreateGroup} className="add-friend-cta" style={{ marginTop: '10px' }}>
                            <Users size={16} />
                            Create Group
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
