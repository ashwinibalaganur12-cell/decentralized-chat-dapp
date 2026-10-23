/**
 * Error Handler for Contract Interactions
 * Provides user-friendly error messages for common blockchain errors
 */

export const handleContractError = (error) => {
    console.error('Contract error:', error);

    // Helper to extract the actual error message from nested objects
    const extractErrorMessage = (err) => {
        if (!err) return '';

        // 1. Check for specific revert reasons in 'info' or 'data'
        const reason = err.reason || err.info?.error?.message || err.data?.message || err.error?.message || err.message;

        if (typeof reason === 'string') {
            return reason;
        }

        // 2. Recursive check for nested 'error' object
        if (err.error) return extractErrorMessage(err.error);
        if (err.info) return extractErrorMessage(err.info);

        return '';
    };

    const fullMessage = extractErrorMessage(error);
    console.log('Extracted error message:', fullMessage);

    // User rejected transaction
    if (error.code === 4001 || error.code === 'ACTION_REJECTED' || fullMessage.includes('user rejected')) {
        return 'Transaction rejected by user';
    }

    // Insufficient funds
    if (error.code === -32603 || fullMessage.includes('insufficient funds')) {
        // However, -32603 is often a generic wrapper for code errors, so we check for other things first
        if (fullMessage.includes('User already exists')) return 'Account already exists for this address';
        if (fullMessage.includes('User is not registered')) return 'Please create an account first';
    }

    // Generic fallback for truncated messages
    // The reproduction script showed "TION exists" (end of "Execution reverted: User already exists")
    if (fullMessage.includes('exists') || fullMessage.includes('User already')) {
        return 'Account already exists for this address';
    }

    // Specific Contract Reverts
    if (fullMessage.includes('User already exists')) {
        return 'Account already exists for this address';
    }

    if (fullMessage.includes('User is not registered')) {
        return 'Please create an account first';
    }

    if (fullMessage.includes('User not found')) {
        return 'User not found on the blockchain';
    }

    if (fullMessage.includes('already friends')) {
        return 'You are already friends with this user';
    }

    if (fullMessage.includes('cannot add themselves')) {
        return 'You cannot add yourself as a friend';
    }

    if (fullMessage.includes('Username cannot be empty')) {
        return 'Username cannot be empty';
    }

    // Network & Gas Errors
    if (error.code === 'NETWORK_ERROR') {
        return 'Network error. Please check your connection';
    }

    if (fullMessage.includes('insufficient funds')) {
        return 'Insufficient funds for gas fee';
    }

    if (fullMessage.includes('cannot estimate gas')) {
        return 'Transaction failed. Likely invalid operation or unauthorized.';
    }

    if (error.code === 'TIMEOUT') {
        return 'Transaction timed out. It may still be pending';
    }

    // Clean up "VM Exception" prefixes if we fall back to the raw message
    return fullMessage.replace('VM Exception while processing transaction: revert ', '')
        .replace('execution reverted: ', '')
        || 'Transaction failed. Please try again';
};

/**
 * Format wallet address for display
 */
export const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Get Etherscan link for transaction
 */
export const getEtherscanLink = (txHash, chainId) => {
    const baseUrls = {
        1: 'https://etherscan.io',
        11155111: 'https://sepolia.etherscan.io',
        1337: null, // localhost
    };

    const baseUrl = baseUrls[chainId];

    if (!baseUrl) return null;

    return `${baseUrl}/tx/${txHash}`;
};
