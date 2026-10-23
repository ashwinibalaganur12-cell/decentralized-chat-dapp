const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("💬 Verifying Messaging Logic...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Account 1 (Alice) -> Sender
    const signer1 = await provider.getSigner(1);
    const address1 = await signer1.getAddress();

    // Account 2 (Bob) -> Receiver
    const signer2 = await provider.getSigner(2);
    const address2 = await signer2.getAddress();

    console.log(`   Sender: ${address1} (Alice)`);
    console.log(`   Receiver: ${address2} (Bob)`);

    // Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer1);

    // 1. Check Friendship
    const friends = await contract.getMyFriendList();
    const isFriend = friends.some(f => f.pubkey.toLowerCase() === address2.toLowerCase());

    if (!isFriend) {
        console.log("❌ Alice is NOT friends with Bob. Adding now...");
        try {
            const tx = await contract.addFriend(address2, "Bob");
            await tx.wait();
            console.log("✅ Friend added.");
        } catch (e) {
            console.log("⚠️ Failed to add friend (might exist):", e.message);
        }
    } else {
        console.log("✅ Alice has Bob as a friend.");
    }

    // 2. Send Message
    console.log("📤 Sending message: 'Hello from verification script!'");
    try {
        const tx = await contract.sendMessage(address2, "Hello from verification script!");
        const receipt = await tx.wait();
        console.log("✅ Message Transaction Confirmed!");
        console.log("   Block Hash:", receipt.blockHash);
    } catch (e) {
        console.error("❌ Send Message FAILED:", e.message);
        // Clean error message
        if (e.data) {
            console.error("   Reason:", ethers.toUtf8String(e.data));
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
