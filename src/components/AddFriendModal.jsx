import React, { useState } from 'react';
import { X, UserPlus, Loader } from 'lucide-react';
import { useChatContract } from '../hooks/useChatContract';
import { handleContractError, isValidAddress, formatAddress } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import './RegisterModal.css'; // Reuse same styles

const AddFriendModal = ({ walletInfo, onSuccess, onClose }) => {
    const [friendAddress, setFriendAddress] = useState('');
    const [friendName, setFriendName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const chatContract = useChatContract(walletInfo?.signer);

    const handleAddFriend = async (e) => {
        e.preventDefault();

        // Validate address
        if (!isValidAddress(friendAddress)) {
            toast.error('Invalid Ethereum address');
            return;
        }

        // Validate name
        if (friendName.length < 2) {
            toast.error('Friend name must be at least 2 characters');
            return;
        }

        // Check if it's not your own address
        if (friendAddress.toLowerCase() === walletInfo.address.toLowerCase()) {
            toast.error('You cannot add yourself as a friend');
            return;
        }

        setIsAdding(true);

        try {

            // Check if friend exists on blockchain
            const exists = await chatContract.checkUserExists(friendAddress);

            if (!exists) {
                toast.error('This user is not registered on the platform');
                setIsAdding(false);
                return;
            }

            // Check if already friends (Client-side check to avoid revert)
            const myFriends = await chatContract.getFriendList();
            console.log("Current Friends:", myFriends);

            // Safer check handling different return types (Ethers Result array vs Object)
            const isAlreadyFriend = myFriends.some(f => {
                const fAddr = f.pubkey || f[0]; // Handle object or array access
                return fAddr && fAddr.toLowerCase() === friendAddress.toLowerCase();
            });

            if (isAlreadyFriend) {
                toast.error('You are already friends with this user!');
                setIsAdding(false);
                return;
            }

            // Add friend
            const result = await chatContract.addFriend(friendAddress, friendName);

            toast.success(`${friendName} added as friend!`);

            // Call success callback
            onSuccess();

            // Close modal
            onClose();

        } catch (error) {
            console.error('Add friend error:', error);

            let errorMessage = handleContractError(error);

            // Refine error message for common cases that might return JSON-RPC error
            if (errorMessage.includes("Internal JSON-RPC error")) {
                if (error.message && error.message.includes("already friends")) {
                    errorMessage = "You are already friends with this user";
                } else {
                    errorMessage = "Transaction failed. Please check the console for details.";
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content register-modal">
                <button
                    className="modal-close"
                    onClick={onClose}
                    disabled={isAdding}
                >
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div className="modal-icon">
                        <UserPlus size={48} />
                    </div>
                    <h2>Add Friend</h2>
                    <p>Add a friend by their wallet address</p>
                </div>

                <form onSubmit={handleAddFriend} className="register-form">
                    <div className="form-group">
                        <label htmlFor="friendAddress">Friend's Wallet Address</label>
                        <input
                            id="friendAddress"
                            type="text"
                            value={friendAddress}
                            onChange={(e) => setFriendAddress(e.target.value.trim())}
                            placeholder="0x..."
                            disabled={isAdding}
                            autoFocus
                        />
                        <div className="input-hint">
                            Enter the full Ethereum address
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="friendName">Friend's Display Name</label>
                        <input
                            id="friendName"
                            type="text"
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            placeholder="Enter display name"
                            disabled={isAdding}
                            maxLength={30}
                        />
                        <div className="input-hint">
                            How you want to identify this friend
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary register-btn"
                        disabled={isAdding || !friendAddress || friendName.length < 2}
                    >
                        {isAdding ? (
                            <>
                                <Loader size={20} className="spin" />
                                Adding Friend...
                            </>
                        ) : (
                            'Add Friend'
                        )}
                    </button>
                </form>

                <div className="modal-footer">
                    <p className="footer-note">
                        This will create a transaction on the blockchain
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddFriendModal;
