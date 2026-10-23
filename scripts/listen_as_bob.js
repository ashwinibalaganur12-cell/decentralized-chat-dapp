const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

// Re-implement decryption logic
const deriveSharedSecret = (address1, address2) => {
    const sorted = [address1.toLowerCase(), address2.toLowerCase()].sort();
    const combined = sorted.join('');
    return CryptoJS.SHA256(combined).toString();
};

const decryptMessage = (encryptedMessage, userAddress, otherAddress) => {
    try {
        const secret = deriveSharedSecret(userAddress, otherAddress);
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secret);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || '[Unable to decrypt]';
    } catch (error) {
        return '[Encrypted Message]';
    }
};

async function main() {
    console.log("👀 Bob is actively polling for NEW messages...");
    console.log("----------------------------------------------");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract and Artifacts
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    // 2. Identify Bob and Sender
    const bobAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    // We'll filter for messages from ANYONE, but specifically display interesting ones

    let lastMessageCount = 0;

    // Initial check
    const checkMessages = async () => {
        try {
            // Check messages from Priya (we assume Priya is the main user for now)
            const priyaAddress = "0x4a1054F8af18b7A41e5f36565c4136E872f1D6A0";

            // Encode call
            const data = contract.interface.encodeFunctionData("readMessage", [priyaAddress]);
            const result = await provider.call({
                to: contractAddress,
                data: data,
                from: bobAddress
            });
            const decoded = contract.interface.decodeFunctionResult("readMessage", result);
            const messages = decoded[0];

            if (messages.length > lastMessageCount) {
                // New messages found!
                // Print only the new ones
                for (let i = lastMessageCount; i < messages.length; i++) {
                    const msg = messages[i];

                    // Only show incoming messages for "Inbox" feel
                    if (msg.sender.toLowerCase() !== bobAddress.toLowerCase()) {
                        const content = decryptMessage(msg.content, bobAddress, msg.sender);
                        console.log(`\n📩 [New Message] From: Priya (${new Date(Number(msg.timestamp) * 1000).toLocaleTimeString()})`);
                        console.log(`   "${content}"`);
                    }
                }
                lastMessageCount = messages.length;
            }
        } catch (e) {
            console.error("Poll error:", e.message);
        }
    };

    // Poll every 2 seconds
    setInterval(checkMessages, 2000);
    checkMessages(); // Run once immediately
}

main().catch((error) => {
    console.error(error);
});
