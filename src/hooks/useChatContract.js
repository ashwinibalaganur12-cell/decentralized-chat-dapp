import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

/**
 * Custom hook for interacting with the ChatApp smart contract
 * @param {object} signer - Ethers signer from wallet
 * @param {object} wsProvider - Optional WebSocket provider for real-time events
 */
export const useChatContract = (signer, wsProvider = null) => {
    const [contract, setContract] = useState(null);
    const [readContract, setReadContract] = useState(null); // For read-only operations
    const [wsContract, setWsContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize read-only contract with direct JSON-RPC (bypasses MetaMask)
    useEffect(() => {
        if (CONTRACT_ADDRESS !== "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
            try {
                const directProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
                const readOnlyContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    directProvider
                );
                setReadContract(readOnlyContract);
                console.log('✅ Read-only contract initialized (direct RPC)');
            } catch (err) {
                console.error('Error initializing read contract:', err);
            }
        }
    }, []);

    // Initialize contract with signer (for transactions)
    useEffect(() => {
        if (signer && CONTRACT_ADDRESS !== "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
            try {
                const chatContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    signer
                );
                setContract(chatContract);
            } catch (err) {
                console.error('Error initializing contract:', err);
                setError('Failed to initialize contract');
            }
        }
    }, [signer]);

    // Initialize WebSocket contract (for events)
    useEffect(() => {
        if (wsProvider && CONTRACT_ADDRESS !== "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
            try {
                const chatWsContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    wsProvider
                );
                setWsContract(chatWsContract);
                console.log('✅ WebSocket contract initialized');
            } catch (err) {
                console.error('Error initializing WebSocket contract:', err);
            }
        }
    }, [wsProvider]);

    // Create user account
    const createAccount = async (username) => {
        if (!contract) throw new Error('Contract not initialized');

        setLoading(true);
        setError(null);

        try {
            // Send transaction (let MetaMask handle gas, but set limit to avoid estimation errors on reverts)
            const tx = await contract.createAccount(username, { gasLimit: 500000 });

            console.log('Transaction sent:', tx.hash);
            await tx.wait();
            console.log('Transaction confirmed!');

            return { success: true, transaction: tx };
        } catch (err) {
            console.error('Error creating account:', err);            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Check if user exists (uses direct RPC to avoid MetaMask issues)
    const checkUserExists = async (address) => {
        // Use readContract for reliable read operations
        const c = readContract || contract;
        if (!c) throw new Error('Contract not initialized');

        try {
            return await c.checkUserExists(address);
        } catch (err) {
            console.error('Error checking user:', err);
            throw err;
        }
    };

    // Get username (uses direct RPC to avoid MetaMask issues)
    const getUsername = async (address) => {
        const c = readContract || contract;
        if (!c) throw new Error('Contract not initialized');

        try {
            return await c.getUsername(address);
        } catch (err) {
            console.error('Error getting username:', err);
            throw err;
        }
    };

    // Add friend
    const addFriend = async (friendAddress, friendName) => {
        if (!contract) throw new Error('Contract not initialized');

        setLoading(true);
        setError(null);

        try {
            // Explicit gas limit to bypass MetaMask gas estimation issues
            const tx = await contract.addFriend(friendAddress, friendName);
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (err) {
            console.error('Error adding friend:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get friend list
    const getFriendList = async () => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            return await contract.getMyFriendList();
        } catch (err) {
            console.error('Error getting friend list:', err);
            throw err;
        }
    };

    // Send message
    const sendMessage = async (friendAddress, message, overrides = {}) => {
        if (!contract) throw new Error('Contract not initialized');

        setLoading(true);
        setError(null);

        try {
            // Default to 3M gas for safety, allow overrides
            const options = { gasLimit: 3000000, ...overrides };
            const tx = await contract.sendMessage(friendAddress, message, options);
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Read messages
    const readMessages = async (friendAddress) => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            const messages = await contract.readMessage(friendAddress);
            return messages.map(msg => ({
                sender: msg.sender,
                timestamp: Number(msg.timestamp),
                content: msg.content
            }));
        } catch (err) {
            console.error('Error reading messages:', err);
            throw err;
        }
    };

    // Get all users
    const getAllUsers = async () => {
        if (!contract) throw new Error('Contract not initialized');

        try {
            return await contract.getAllAppUser();
        } catch (err) {
            console.error('Error getting all users:', err);
            throw err;
        }
    };

    // Create Group
    const createGroup = async (groupName, members) => {
        if (!contract) throw new Error('Contract not initialized');
        setLoading(true);
        try {
            const tx = await contract.createGroup(groupName, members);
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (err) {
            console.error('Error creating group:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Send Group Message
    const sendGroupMessage = async (groupId, message) => {
        if (!contract) throw new Error('Contract not initialized');
        setLoading(true);
        try {
            // Explicit gas limit for groups
            const tx = await contract.sendGroupMessage(groupId, message, { gasLimit: 500000 });
            await tx.wait();
            return { success: true, transaction: tx };
        } catch (err) {
            console.error('Error sending group message:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Read Group Messages
    const readGroupMessages = async (groupId) => {
        // Must use signer contract because contract checks msg.sender for membership
        if (!contract) throw new Error('Contract not initialized');

        try {
            const messages = await contract.readGroupMessages(groupId);
            return messages.map(msg => ({
                sender: msg.sender,
                timestamp: Number(msg.timestamp),
                content: msg.content
            }));
        } catch (err) {
            console.error('Error reading group messages:', err);
            throw err;
        }
    };

    // Get My Groups
    const getMyGroups = async () => {
        // Must use signer contract because contract checks msg.sender
        if (!contract) throw new Error('Contract not initialized');

        try {
            const groups = await contract.getMyGroups();
            return groups; // Return raw, App.jsx handles formatting
        } catch (err) {
            console.error('Error getting my groups:', err);
            throw err;
        }
    };

    return {
        contract,
        readContract,
        wsContract,
        loading,
        error,
        createAccount,
        checkUserExists,
        getUsername,
        addFriend,
        getFriendList,
        sendMessage,
        readMessages,
        getAllUsers,
        createGroup,
        sendGroupMessage,
        readGroupMessages,
        getMyGroups
    };
};
