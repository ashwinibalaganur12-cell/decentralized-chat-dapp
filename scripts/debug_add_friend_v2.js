const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Debugging Add Friend (Deployer -> Alice)...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Get Signer #0 (Deployer)
    const signer = await provider.getSigner(0);
    const deployerAddress = await signer.getAddress();
    console.log("👤 Deployer Address:", deployerAddress);

    // Get Contract Address
    // const contractAddress = fs.readFileSync(addressPath, "utf8").trim();\n    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    console.log("📝 Contract Address:", contractAddress);

    // Get Artifact
    // Note: Adjust path if necessary. Standard Hardhat path:
    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found at:", artifactPath);
        return;
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    // Target Friend (Alice)
    const aliceAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // 1. Check if Deployer exists
    console.log("\n[1] Checking if Deployer exists...");
    try {
        const deployerExists = await contract.checkUserExists(deployerAddress);
        console.log(`   Result: ${deployerExists}`);
        if (!deployerExists) {
            console.error("❌ Deployer is NOT registered! Run setup_full_state.js");
            return;
        }
    } catch (e) {
        console.error("❌ checkUserExists(Deployer) failed:", e.message);
    }

    // 2. Check if Alice exists
    console.log("\n[2] Checking if Alice exists...");
    try {
        const aliceExists = await contract.checkUserExists(aliceAddress);
        console.log(`   Result: ${aliceExists}`);
        if (!aliceExists) {
            console.error("❌ Alice is NOT registered!");
            return;
        }
    } catch (e) {
        console.error("❌ checkUserExists(Alice) failed:", e.message);
    }

    // 3. Check if already friends
    console.log("\n[3] Checking friend list...");
    const friends = await contract.getMyFriendList();
    const isFriend = friends.some(f => f.pubkey.toLowerCase() === aliceAddress.toLowerCase());
    console.log(`   Already friends? ${isFriend}`);

    if (isFriend) {
        console.log("⚠️ Already friends. Attempting to add again might revert or fail logic.");
    }

    // 4. Try Add Friend
    console.log("\n[4] Attempting Add Friend...");
    try {
        const tx = await contract.addFriend(aliceAddress, "Alice Test", { gasLimit: 500000 });
        console.log("   Transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ Add Friend SUCCESS!");
    } catch (e) {
        console.error("❌ Add Friend FAILED:");
        if (e.data) console.error("   Data:", e.data);
        if (e.reason) console.error("   Reason:", e.reason);
        console.error("   Message:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
