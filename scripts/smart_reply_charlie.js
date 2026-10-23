const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

// --- Encryption Utilities ---

const deriveSharedSecret = (address1, address2) => {
    const sorted = [address1.toLowerCase(), address2.toLowerCase()].sort();
    const combined = sorted.join('');
    return CryptoJS.SHA256(combined).toString();
};

const encryptMessage = (message, senderAddress, recipientAddress) => {
    const secret = deriveSharedSecret(senderAddress, recipientAddress);
    return CryptoJS.AES.encrypt(message, secret).toString();
};

const decryptMessage = (encryptedMessage, myAddress, otherAddress) => {
    try {
        const secret = deriveSharedSecret(myAddress, otherAddress);
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || "[Unable to decrypt]";
    } catch (e) {
        return "[Decryption Error]";
    }
};

// --- Main Bot Logic ---

async function main() {
    console.log("🤖 Smart Charlie Bot Starting...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read contract config
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Connect as Charlie (Account #3)
    const signer = await provider.getSigner(3);
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);
    const myAddress = signer.address;

    console.log(`👤 Bot Identity: Charlie (${myAddress})`);

    // Get Friends
    const friends = await contract.getMyFriendList();
    if (friends.length === 0) {
        console.log("❌ Charlie has no friends. Add him first!");
        return;
    }

    // Process each friend
    for (const friend of friends) {
        console.log(`\n🔍 Checking chat with ${friend.name} (${friend.pubkey})...`);

        const messages = await contract.readMessage(friend.pubkey);
        if (messages.length === 0) {
            console.log("   (No messages)");
            continue;
        }

        // Get the very last message
        const lastMsg = messages[messages.length - 1];

        // Only reply if the last message was NOT sent by me (Charlie)
        // We assume typical chat flow: User sends -> Bot replies.
        if (lastMsg.sender === myAddress) {
            console.log("   (Last message was from me. Waiting for user reply...)");
            continue;
        }

        // Decrypt the message
        console.log("   📨 New message found!");
        const plainText = decryptMessage(lastMsg.content, myAddress, friend.pubkey);
        console.log(`   💬 User said: "${plainText}"`);

        // Generate Smart Reply
        let reply = "";
        const lowerText = plainText.toLowerCase();

        if (lowerText.includes("how are you")) {
            reply = "I'm doing great, running on the blockchain! How about you?";
        } else if (lowerText.includes("doing") || lowerText.includes("what up")) {
            reply = "I'm just a script processing transactions. Pretty cool, huh?";
        } else if (lowerText.includes("hello") || lowerText.includes("hi")) {
            reply = "Hello there! I am ready to chat.";
        } else if (lowerText.includes("bye")) {
            reply = "Goodbye! See you on the next block.";
        } else {
            reply = "That's interesting! Tell me more.";
        }

        console.log(`   💡 Generating reply: "${reply}"`);

        // Encrypt and Send
        const encryptedReply = encryptMessage(reply, myAddress, friend.pubkey);

        try {
            const tx = await contract.sendMessage(friend.pubkey, encryptedReply);
            await tx.wait();
            console.log("   ✅ Reply sent successfully!");
        } catch (error) {
            console.error("   ❌ Failed to send reply:", error.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
