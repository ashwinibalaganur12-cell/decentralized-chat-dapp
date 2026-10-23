const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Debugging Revert for Account 0...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const myAddress = await signer.getAddress();
    console.log("👤 My Address:", myAddress);

    // Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    console.log("📝 Contract:", contractAddress);

    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    /* Part 1 Commented Out
    // 1. Check My Registration
    ...
    */
    console.log("🔍 Debugging Hardhat1 -> Hardhat2 ONLY...");

    // 4. Test "Hardhat1" (Alice/Account 1) adding "Hardhat2" (Bob/Account 2)
    const signer1 = await provider.getSigner(1);
    const address1 = await signer1.getAddress();
    console.log("   From (Hardhat1): ", address1);

    const address2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Hardhat 2 (Bob)
    console.log("   To Add (Hardhat2): ", address2);

    // CHECK FRIENDSHIP
    const contractAsUser1 = contract.connect(signer1);
    const friends1 = await contractAsUser1.getMyFriendList();
    const isAlreadyFriend = friends1.some(f => f.pubkey.toLowerCase() === address2.toLowerCase());
    console.log(`   [Check] Are they friends? ${isAlreadyFriend}`);

    if (isAlreadyFriend) {
        console.log("⚠️ THEY ARE ALREADY FRIENDS. Adding will revert!");
    } else {
        console.log("✅ They are NOT friends. Attempting add...");
        try {
            await contractAsUser1.addFriend.staticCall(address2, "Bob");
            console.log("✅ Simulation SUCCESS.");
        } catch (e) {
            console.error("❌ Simulation FAILED:", e.message);
        }
    }

    // If all clear, try simulation
    if (amIRegistered && isAliceRegistered && !isFriend) {
        console.log("⚡ Simulation: Attempting to Add Alice...");
        try {
            await contract.addFriend.staticCall(aliceAddress, "Alice");
            console.log("✅ Simulation SUCCESS: Transaction should work.");
        } catch (e) {
            console.error("❌ Simulation FAILED:");
            console.error("   Reason:", e.reason);
            console.error("   Message:", e.message);
            if (e.data) console.error("   Data:", e.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
