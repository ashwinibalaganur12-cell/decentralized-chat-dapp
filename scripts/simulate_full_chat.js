const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Chat Simulation...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read contract address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("❌ Contract address not found. Deploy first.");
        process.exit(1);
    }
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    // Read ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    // Get Signers
    // Account #0: The User (You)
    // Account #1: The Friend (Test User 2)
    const user1 = await provider.getSigner(0);
    const user2 = await provider.getSigner(1);

    const contract1 = new ethers.Contract(contractAddress, abi, user1);
    const contract2 = new ethers.Contract(contractAddress, abi, user2);

    console.log(`\n👤 User 1: ${user1.address} (You)`);
    console.log(`👤 User 2: ${user2.address} (Friend)`);

    // 1. Ensure both are registered
    console.log("\n📝 Checking Registration...");

    if (!await contract1.checkUserExists(user1.address)) {
        console.log("   Registering User 1...");
        await (await contract1.createAccount("My Main Account")).wait();
    } else {
        console.log("   User 1 already registered.");
    }

    if (!await contract2.checkUserExists(user2.address)) {
        console.log("   Registering User 2...");
        await (await contract2.createAccount("Test User 2")).wait();
    } else {
        console.log("   User 2 already registered.");
    }

    // 2. Add Friends (Mutual)
    console.log("\n🤝 Connecting Friends...");

    // User 1 adds User 2
    try {
        await (await contract1.addFriend(user2.address, "Test User 2")).wait();
        console.log("   ✅ You added Test User 2");
    } catch (e) {
        console.log("   (User 1 -> User 2 connection issue or already exists)");
    }

    // User 2 adds User 1
    try {
        await (await contract2.addFriend(user1.address, "My Main Account")).wait();
        console.log("   ✅ Test User 2 added You");
    } catch (e) {
        console.log("   (User 2 -> User 1 connection issue or already exists)");
    }

    // 3. Send Messages
    console.log("\n💬 Sending Messages...");

    // User 1 -> User 2
    await (await contract1.sendMessage(user2.address, "Hello! Can you see this?")).wait();
    console.log("   📨 You sent: 'Hello! Can you see this?'");

    // User 2 -> User 1
    await (await contract2.sendMessage(user1.address, "Yes, I can! We are connected. 🚀")).wait();
    console.log("   📨 Friend sent: 'Yes, I can! We are connected. 🚀'");

    console.log("\n✨ SIMULATION COMPLETE!");
    console.log("👉 Go to your browser and refresh. You should see the friend and messages immediately.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
