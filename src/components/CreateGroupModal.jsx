import React, { useState } from 'react';
import { X, Users, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import './RegisterModal.css'; // Reuse existing modal styles

const CreateGroupModal = ({ isOpen, onClose, friendList, onGroupCreated, createGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const toggleFriend = (address) => {
        if (selectedFriends.includes(address)) {
            setSelectedFriends(selectedFriends.filter(addr => addr !== address));
        } else {
            setSelectedFriends([...selectedFriends, address]);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        if (selectedFriends.length === 0) {
            toast.error('Please select at least one friend');
            return;
        }

        try {
            setIsLoading(true);

            // Use the wrapper function which handles wait() internally
            await createGroup(groupName, selectedFriends);

            const toastId = toast.loading('Creating group...', {
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });

            // await tx.wait(); // Removed because wrapper handles it

            toast.dismiss(toastId);
            toast.success('Group created successfully!');

            if (onGroupCreated) onGroupCreated();
            onClose();
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Failed to create group. ' + (error.reason || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFriends = friendList.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-effect">
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <Users size={48} className="modal-icon" />
                    <h2>Create New Group</h2>
                    <p>Name your group and add members</p>
                </div>

                <form onSubmit={handleCreateGroup} className="modal-form">
                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Project Team"
                            maxLength={30}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Members ({selectedFriends.length})</label>

                        {/* Search friends */}
                        {friendList.length > 5 && (
                            <div className="search-box" style={{ marginBottom: '10px' }}>
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search friends..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        )}

                        <div className="friends-selection-list">
                            {filteredFriends.length > 0 ? (
                                filteredFriends.map(friend => (
                                    <div
                                        key={friend.address}
                                        className={`friend-select-item ${selectedFriends.includes(friend.address) ? 'selected' : ''}`}
                                        onClick={() => toggleFriend(friend.address)}
                                    >
                                        <div className="friend-info">
                                            <span className="friend-avatar">
                                                {friend.name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="friend-name">{friend.name}</span>
                                        </div>
                                        {selectedFriends.includes(friend.address) && <Check size={18} className="check-icon" />}
                                    </div>
                                ))
                            ) : (
                                <p className="no-friends">No friends found</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading || !groupName.trim() || selectedFriends.length === 0}
                    >
                        {isLoading ? (
                            <div className="spinner-small"></div>
                        ) : 'Create Group'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
