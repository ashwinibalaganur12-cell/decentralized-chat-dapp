const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const CryptoJS = require("crypto-js");

// Re-implement decryption
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
    console.log("🔍 Checking Messages for Bob (Active Poll)...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 2. Bob (Account #1)
    const bobAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // 3. Priya (The sender)
    const priyaAddress = "0x4a1054F8af18b7A41e5f36565c4136E872f1D6A0";

    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    try {
        // Impersonate Bob to read his messages from Priya
        // We use provider.call to simulate the view function as Bob

        const data = contract.interface.encodeFunctionData("readMessage", [priyaAddress]);

        const result = await provider.call({
            to: contractAddress,
            data: data,
            from: bobAddress // <--- Important: Acting as Bob
        });

        const decoded = contract.interface.decodeFunctionResult("readMessage", result);
        const messages = decoded[0]; // Struct array

        console.log(`\n📨 Messages between Bob & Priya: ${messages.length}`);

        if (messages.length === 0) {
            console.log("   (No messages found. Did the transaction succeed?)");
        }

        messages.forEach((msg, i) => {
            const senderName = (msg.sender.toLowerCase() === bobAddress.toLowerCase()) ? "Bob" : "Priya";
            const content = decryptMessage(msg.content, bobAddress, priyaAddress);

            console.log(`\n[${i + 1}] From: ${senderName} (${new Date(Number(msg.timestamp) * 1000).toLocaleTimeString()})`);
            console.log(`    "${content}"`);
        });

    } catch (error) {
        console.error("Error reading messages:", error.message);
    }
}

main();
