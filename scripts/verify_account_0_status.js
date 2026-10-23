const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Verifying Account 0 (Deployer) Status...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const deployerAddress = await signer.getAddress();
    console.log("👤 Deployer:", deployerAddress);

    // Get Contract Address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    console.log("📝 Contract:", contractAddress);

    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    // Target Friend (Alice)
    const aliceAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    console.log("🎯 Alice:", aliceAddress);

    console.log("\n--- Checking Requirements ---");

    // 1. Check if Deployer is registered
    const isDeployerRegistered = await contract.checkUserExists(deployerAddress);
    console.log(`[1] Deployer Registered? ${isDeployerRegistered} (Required: true)`);

    // 2. Check if Alice is registered
    const isAliceRegistered = await contract.checkUserExists(aliceAddress);
    console.log(`[2] Alice Registered?    ${isAliceRegistered} (Required: true)`);

    // 3. Check if Add Self
    const isSelf = deployerAddress.toLowerCase() === aliceAddress.toLowerCase();
    console.log(`[3] Is Self?             ${isSelf} (Required: false)`);

    // 4. Check if Already Friends
    // Note: checkAlreadyFriends is internal, so we check getMyFriendList
    const friends = await contract.getMyFriendList();
    const isFriend = friends.some(f => f.pubkey.toLowerCase() === aliceAddress.toLowerCase());
    console.log(`[4] Already Friends?     ${isFriend} (Required: false)`);

    if (isDeployerRegistered && isAliceRegistered && !isSelf && !isFriend) {
        console.log("\n✅ ALL CHECKS PASSED. Transaction SHOULD succeed.");
        console.log("⚡ Attempting Add Friend transaction now...");
        try {
            const tx = await contract.addFriend(aliceAddress, "Alice", { gasLimit: 500000 });
            console.log("   Sent:", tx.hash);
            await tx.wait();
            console.log("✅ SUCCESS!");
        } catch (e) {
            console.error("❌ FAILED despite checks:", e.message);
            if (e.data) console.error("   Data:", e.data);
        }
    } else {
        console.error("\n❌ CHECKS FAILED. Transaction will revert.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
