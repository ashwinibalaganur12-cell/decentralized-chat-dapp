const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

// Re-implementing the encryption logic from src/utils/encryption.js
const deriveSharedSecret = (address1, address2) => {
    const sorted = [address1.toLowerCase(), address2.toLowerCase()].sort();
    const combined = sorted.join('');
    return CryptoJS.SHA256(combined).toString();
};

const encryptMessage = (message, senderAddress, recipientAddress) => {
    const secret = deriveSharedSecret(senderAddress, recipientAddress);
    const encrypted = CryptoJS.AES.encrypt(message, secret).toString();
    return encrypted;
};

async function main() {
    console.log("🚀 Sending Reply from Charlie...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read contract address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    // Read ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Connect as Charlie (Account #3)
    const signer = await provider.getSigner(3);
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    console.log(`\n👤 Sender: Charlie (${signer.address})`);

    // Find a friend to reply to (assuming the user is one of the friends)
    const friends = await contract.getMyFriendList();
    if (friends.length === 0) {
        console.error("❌ Charlie has no friends to reply to.");
        console.log("   (Did you add Charlie as a friend from the UI?)");
        process.exit(1);
    }

    // Pick the last friend added (most likely the active user)
    const targetFriend = friends[friends.length - 1];

    console.log(`🎯 Recipient: ${targetFriend.name} (${targetFriend.pubkey})`);

    // Prepare message
    const messageContent = "Hello! I received your message. This is an auto-reply.";
    console.log(`💬 Message: "${messageContent}"`);

    // Encrypt
    console.log("🔐 Encrypting...");
    const encryptedMsg = encryptMessage(messageContent, signer.address, targetFriend.pubkey);
    console.log(`   Cyphertext: ${encryptedMsg.substring(0, 20)}...`);

    // Send
    console.log("📤 Sending transaction...");
    try {
        const tx = await contract.sendMessage(targetFriend.pubkey, encryptedMsg);
        await tx.wait();
        console.log("✅ Message sent successfully!");
        console.log("👉 Check your DApp inbox now!");
    } catch (error) {
        console.error("❌ Failed to send message:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
