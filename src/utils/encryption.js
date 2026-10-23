import CryptoJS from 'crypto-js';

/**
 * Derive a shared secret between two addresses
 * This creates a unique key for each conversation
 */
export const deriveSharedSecret = (address1, address2) => {
    // Sort addresses to ensure same secret regardless of order
    const sorted = [address1.toLowerCase(), address2.toLowerCase()].sort();
    const combined = sorted.join('');
    return CryptoJS.SHA256(combined).toString();
};

/**
 * Encrypt a message for a conversation
 * Both sender and recipient can decrypt using their shared secret
 * 
 * @param {string} message - Plain text message
 * @param {string} senderAddress - Sender's wallet address
 * @param {string} recipientAddress - Recipient's wallet address
 * @returns {string} Encrypted message
 */
export const encryptMessage = (message, senderAddress, recipientAddress) => {
    try {
        const secret = deriveSharedSecret(senderAddress, recipientAddress);
        const encrypted = CryptoJS.AES.encrypt(message, secret).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
};

/**
 * Decrypt a message from a conversation
 * Works for both sender and recipient
 * 
 * @param {string} encryptedMessage - Encrypted message from blockchain
 * @param {string} userAddress - Current user's wallet address
 * @param {string} otherAddress - Other user's wallet address (sender or recipient)
 * @returns {string} Decrypted message or error indicator
 */
export const decryptMessage = (encryptedMessage, userAddress, otherAddress) => {
    try {
        const secret = deriveSharedSecret(userAddress, otherAddress);
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secret);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            return '[Unable to decrypt]';
        }

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return '[Encrypted Message]';
    }
};

/**
 * Check if a message is encrypted
 * @param {string} message - Message to check
 * @returns {boolean} True if message appears to be encrypted
 */
export const isEncrypted = (message) => {
    // AES encrypted messages from crypto-js start with "U2FsdGVkX1" (base64 "Salted__")
    return message && message.startsWith('U2FsdGVkX1');
};
