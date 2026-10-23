import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import './ConnectWallet.css';
import { getSigner } from '../utils/contractHelpers';
import { ethers } from 'ethers';

// Helper to check MetaMask installation
const isMetaMaskInstalled = () => typeof window !== 'undefined' && !!window.ethereum;

const ConnectWallet = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [networkInfo, setNetworkInfo] = useState(null);

    // Fetch network info using the signer/provider from contractHelpers
    const getNetworkInfo = async () => {
        if (!isMetaMaskInstalled()) return;
        try {
            const signer = await getSigner();
            const provider = signer.provider;
            const network = await provider.getNetwork();
            setNetworkInfo({
                name: network.name,
                chainId: Number(network.chainId),
            });
        } catch (err) {
            console.error('Error getting network info:', err);
        }
    };

    useEffect(() => {
        getNetworkInfo();
        // Listen for chain changes and reload to reflect new network
        if (window.ethereum) {
            const handleChainChanged = () => window.location.reload();
            window.ethereum.on('chainChanged', handleChainChanged);
            return () => {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    const handleConnect = async () => {
        setError(null);
        setIsConnecting(true);
        if (!isMetaMaskInstalled()) {
            setError('MetaMask is not installed. Please install MetaMask to use this app.');
            setIsConnecting(false);
            return;
        }
        try {
            const signer = await getSigner();
            const provider = signer.provider;
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            const balance = await provider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);

            onConnect({
                address,
                provider,
                signer,
                network: {
                    name: network.name,
                    chainId: Number(network.chainId),
                },
                balance: balanceInEth,
            });
        } catch (err) {
            console.error('Error connecting wallet:', err);
            if (err.code === 4001) {
                setError('Connection request rejected. Please approve the connection in MetaMask.');
            } else if (err.code === -32002 || err?.error?.code === -32002 || err?.info?.error?.code === -32002) {
                setError('Check your MetaMask extension! A connection request is already pending. Please open the extension to approve it.');
            } else {
                setError(err.message || 'Failed to connect wallet. Please try again.');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="connect-wallet-container">
            <div className="connect-card glass-panel animate-fade-in">
                <div className="icon-wrapper">
                    <Wallet size={48} className="wallet-icon" />
                </div>
                <h1 className="title text-gradient">Welcome to Chat DApp</h1>
                <p className="subtitle">
                    Secure, decentralized communication powered by the Ethereum blockchain.
                    Connect your wallet to start chatting.
                </p>
                {/* Network Info */}
                {networkInfo && (
                    <div
                        style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <CheckCircle size={16} color="#3b82f6" />
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                            Network: {networkInfo.name} (Chain ID: {networkInfo.chainId})
                        </span>
                    </div>
                )}
                {/* Error/Info Message */}
                {error && (
                    <div
                        style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: error.includes('pending') ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            border: error.includes('pending') ? '1px solid rgba(234, 179, 8, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                    >
                        <AlertCircle size={16} color={error.includes('pending') ? '#eab308' : '#ef4444'} style={{ marginTop: '2px' }} />
                        <span style={{ fontSize: '0.875rem', color: error.includes('pending') ? '#fde047' : '#fca5a5', flex: 1 }}>{error}</span>
                    </div>
                )}
                {/* Connect Button */}
                <button
                    onClick={handleConnect}
                    className="btn-primary connect-btn"
                    disabled={isConnecting}
                    style={{ opacity: isConnecting ? 0.7 : 1 }}
                >
                    <Wallet size={20} />
                    {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </button>
                {/* MetaMask Installation Link */}
                {!isMetaMaskInstalled() && (
                    <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            marginTop: '1rem',
                            fontSize: '0.875rem',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            display: 'inline-block',
                        }}
                    >
                        Install MetaMask →
                    </a>
                )}
            </div>
        </div>
    );
};

export default ConnectWallet;
