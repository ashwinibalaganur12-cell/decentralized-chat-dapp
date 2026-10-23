const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Debugging Add Friend Transaction (Standalone)...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Connect as read-only first
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    // 2. Find 'priya' (User)
    console.log("👉 Looking for 'priya'...");
    const users = await contract.getAllAppUser();
    const priyaUser = users.find(u => u.name === "priya");

    if (!priyaUser) {
        console.error("❌ User 'priya' not found on blockchain!");
        return;
    }
    console.log(`✅ Found 'priya' at ${priyaUser.accountAddress}`);

    // 3. Find 'Alice' (Friend) - or use the hardcoded test address
    const friendAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    console.log(`👉 Trying to add friend: ${friendAddress} (Alice)`);

    // 4. Check Pre-conditions
    const isUser = await contract.checkUserExists(priyaUser.accountAddress);
    const isFriend = await contract.checkUserExists(friendAddress);

    console.log(`   Priya exists? ${isUser}`);
    console.log(`   Friend exists? ${isFriend}`);

    if (!isUser || !isFriend) {
        console.error("❌ One of the users does not exist. Cannot add friend.");
        return;
    }

    // 5. Simulate Transaction using Impersonation
    console.log("\n⚡ Simulating transaction...");
    try {
        await provider.send("hardhat_impersonateAccount", [priyaUser.accountAddress]);

        const signer = await provider.getSigner(priyaUser.accountAddress);
        const contractWithSigner = contract.connect(signer);

        // Attempt addFriend
        console.log("   Sending transaction...");
        const tx = await contractWithSigner.addFriend(friendAddress, "Alice");
        console.log("   Waiting for confirmation...");
        await tx.wait();
        console.log("✅ Simulation SUCCESS! Transaction should work.");
    } catch (error) {
        console.error("\n❌ Simulation FAILED!");
        console.error("---------------------------------------------------");
        console.error("REVERT REASON:", error.message);

        if (error.data) {
            console.error("Revert Data:", error.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
