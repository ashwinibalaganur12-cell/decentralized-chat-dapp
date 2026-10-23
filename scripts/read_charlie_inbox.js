const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("📬 Checking Charlie's Inbox...");

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

    console.log(`👤 Connected as: Charlie (${signer.address})`);

    try {
        // 1. Get List of Friends
        console.log("\n👥 Fetching Charlie's friends...");
        const friends = await contract.getMyFriendList();

        if (friends.length === 0) {
            console.log("   (No friends found. You need to add Charlie as a friend first!)");
        }

        // 2. Read messages from each friend
        for (const friend of friends) {
            console.log(`\n📨 Chat with ${friend.name} (${friend.pubkey}):`);

            const messages = await contract.readMessage(friend.pubkey);

            if (messages.length === 0) {
                console.log("   (No messages)");
            } else {
                messages.forEach((msg, i) => {
                    const date = new Date(Number(msg.timestamp) * 1000).toLocaleString();
                    const senderName = (msg.sender === signer.address) ? "Charlie" : friend.name;
                    console.log(`   [${date}] ${senderName}: ${msg.content}`);
                });
            }
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
