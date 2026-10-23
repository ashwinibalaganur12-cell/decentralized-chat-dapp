import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getCurrentNetwork } from "../config/contract";

/**
 * Get an ethers provider. Uses MetaMask if available, otherwise falls back to the configured network RPC.
 */
export const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
        // If multiple providers are injected (e.g. MetaMask + Phantom), find MetaMask
        if (window.ethereum.providers) {
            const metaMaskProvider = window.ethereum.providers.find(p => p.isMetaMask && !p.isPhantom);
            if (metaMaskProvider) {
                return new ethers.BrowserProvider(metaMaskProvider);
            }
        }

        // If the current provider is Phantom, checks if the user really wants MetaMask
        // But for standard usage, we just use whatever is window.ethereum if it supports EIP-1193
        // However, to strictly follow "connect to metamask", we prefer isMetaMask

        return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to default network (localhost)
    const network = getCurrentNetwork();
    return new ethers.JsonRpcProvider(network.rpcUrl);
};

/**
 * Request the user to connect their wallet and return a signer.
 * Also ensures MetaMask is connected to the correct network (Hardhat localhost).
 */
export const getSigner = async () => {
    const provider = getProvider();

    // First, ensure MetaMask is connected to Hardhat localhost (chain ID 1337)
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // If not on Hardhat localhost, switch network
        if (chainId !== 1337) {
            console.log('Switching to Hardhat localhost network...');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }], // 1337 in hex
                });
            } catch (switchError) {
                // If the network doesn't exist, add it
                if (switchError.code === 4902) {
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
                } else {
                    throw switchError;
                }
            }
        }
    } catch (networkError) {
        console.warn('Network switch failed:', networkError);
        // Continue anyway - user might need to manually switch
    }

    // Prompt MetaMask to connect accounts
    try {
        await provider.send("eth_requestAccounts", []);
    } catch (error) {
        if (error.code === -32002) {
            // Check if it is a "Check your browser" pending request or an RPC error
            if (error.message && error.message.includes("RPC endpoint returned too many errors")) {
                console.warn("RPC endpoint returned too many errors");
                throw new Error("Local Hardhat Node not running or congested");
            }
            // Remove the blocking alert.
            // Re-throw the original error so the UI can check error.code === -32002
            throw error;
        }
        throw error;
    }
    return provider.getSigner();
};

/**
 * Return a connected contract instance ready for read/write calls.
 */
export const getContract = async () => {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Helper to listen for a contract event and invoke a callback.
 * @param {string} eventName - Name of the event (e.g., "MessageSent")
 * @param {function} callback - Function to call with event args
 */
export const subscribeToEvent = async (eventName, callback) => {
    const contract = await getContract();
    contract.on(eventName, (...args) => {
        // The last argument is the event object; we ignore it here
        callback(...args);
    });
    // Return an unsubscribe function
    return () => contract.removeAllListeners(eventName);
};
