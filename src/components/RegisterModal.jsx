import React, { useState } from 'react';
import { X, User, Loader } from 'lucide-react';
import { useChatContract } from '../hooks/useChatContract';
import { handleContractError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import './RegisterModal.css';

const RegisterModal = ({ walletInfo, onSuccess, onClose }) => {
    const [username, setUsername] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const chatContract = useChatContract(walletInfo?.signer);

    const validateUsername = (name) => {
        if (name.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (name.length > 20) {
            return 'Username must be less than 20 characters';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return 'Username can only contain letters, numbers and underscores';
        }
        return null;
    };

    // Ensure MetaMask is on the correct network (Hardhat localhost)
    const ensureCorrectNetwork = async () => {
        if (!window.ethereum) return true;

        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChainId = parseInt(chainId, 16);

            console.log('Current chain ID:', currentChainId);

            // Hardhat localhost chain ID is 1337 (0x539)
            if (currentChainId !== 1337) {
                toast.loading('Switching to Hardhat Localhost network...', { id: 'network-switch' });

                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x539' }], // 1337 in hex
                    });
                    toast.success('Switched to Hardhat Localhost!', { id: 'network-switch' });
                    // Wait a moment for the switch to complete
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return true;
                } catch (switchError) {
                    // Network doesn't exist, add it
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: '0x539',
                                    chainName: 'Hardhat Localhost',
                                    nativeCurrency: {
                                        name: 'Ethereum',
                                        symbol: 'ETH',
                                        decimals: 18
                                    },
                                    rpcUrls: ['http://localhost:8545'],
                                }],
                            });
                            toast.success('Added and switched to Hardhat Localhost!', { id: 'network-switch' });
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            return true;
                        } catch (addError) {
                            toast.error('Failed to add network. Please add Hardhat Localhost (http://127.0.0.1:8545) manually.', { id: 'network-switch' });
                            return false;
                        }
                    } else if (switchError.code === 4001) {
                        toast.error('Network switch rejected. Please switch to Hardhat Localhost manually.', { id: 'network-switch' });
                        return false;
                    } else {
                        toast.error('Failed to switch network: ' + switchError.message, { id: 'network-switch' });
                        return false;
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('Network check error:', error);
            return true; // Continue anyway
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate username
        const error = validateUsername(username);
        if (error) {
            toast.error(error);
            return;
        }

        setIsRegistering(true);

        try {
            // First ensure we're on the correct network
            const networkOk = await ensureCorrectNetwork();
            if (!networkOk) {
                setIsRegistering(false);
                return;
            }

            // Create account on blockchain
            const result = await chatContract.createAccount(username);

            // Wait for confirmation
            toast.success('Account created successfully!');

            // Call success callback
            onSuccess(username);

        } catch (error) {
            console.error('Registration error:', error);

            // Checking for "Internal JSON-RPC error" which often masks "User already exists"
            // or explicitly checking if the user is now registered (race condition recovery)
            try {
                const exists = await chatContract.checkUserExists(walletInfo.address);
                if (exists) {
                    const existingName = await chatContract.getUsername(walletInfo.address);
                    toast.success(`Account recovered! Welcome back, ${existingName}`);
                    onSuccess(existingName);
                    return;
                }
            } catch (checkErr) {
                console.log("Recovery check failed:", checkErr);
            }

            const errorMessage = handleContractError(error);
            toast.error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content register-modal">
                <button
                    className="modal-close"
                    onClick={onClose}
                    disabled={isRegistering}
                >
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <div className="modal-icon">
                        <User size={48} />
                    </div>
                    <h2>Create Your Account</h2>
                    <p>Choose a username for the blockchain</p>

                    {walletInfo?.address && (
                        <div className="connected-account-info">
                            <span className="account-label">Connected:</span>
                            <span className="account-address">
                                {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                            </span>
                            <button
                                type="button"
                                className="switch-account-btn"
                                onClick={async () => {
                                    if (window.ethereum) {
                                        console.log("Switch button clicked");
                                        try {
                                            toast.loading("Opening MetaMask...", { id: "switch-wallet" });
                                            await window.ethereum.request({
                                                method: "wallet_requestPermissions",
                                                params: [{ eth_accounts: {} }]
                                            });
                                            toast.dismiss("switch-wallet");
                                        } catch (err) {
                                            console.error("Failed to switch account:", err);
                                            toast.dismiss("switch-wallet");

                                            // Handle "Already pending" error (code -32002)
                                            if (err.code === -32002 || err.message.toLowerCase().includes("pending")) {
                                                toast.error("MetaMask is already open! Please check your taskbar (it might be minimized) or extension icon.", {
                                                    duration: 6000,
                                                    icon: '🔔'
                                                });
                                            } else {
                                                toast.error("Failed to switch: " + (err.message || "Unknown error"));
                                            }
                                        }
                                    } else {
                                        toast.error("MetaMask not detected");
                                    }
                                }}
                            >
                                Switch
                            </button>
                        </div>
                    )}
                </div>

                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={isRegistering}
                            autoFocus
                            maxLength={20}
                        />
                        <div className="input-hint">
                            3-20 characters, letters, numbers and underscores only
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary register-btn"
                        disabled={isRegistering || username.length < 3}
                    >
                        {isRegistering ? (
                            <>
                                <Loader size={20} className="spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
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

export default RegisterModal;
