const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Verifying ChatApp Contract...");

    // Connect to local node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Get contract address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Get ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    // Get signer
    const signer = await provider.getSigner(); // Account 0
    console.log(`👤 Testing with account: ${signer.address}`);

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // 1. Check if user exists (should be false initially)
    const existsBefore = await contract.checkUserExists(signer.address);
    console.log(`❓ User exists before registration: ${existsBefore}`);

    if (existsBefore) {
        console.log("⚠️ User already exists. Skipping registration.");
    } else {
        // 2. Create Account
        console.log("📝 Creating account 'TestUser'...");
        const tx = await contract.createAccount("TestUser");
        await tx.wait();
        console.log("✅ Account created!");
    }

    // 3. Check again
    const existsAfter = await contract.checkUserExists(signer.address);
    console.log(`❓ User exists after registration: ${existsAfter}`);

    // 4. Get username
    const username = await contract.getUsername(signer.address);
    console.log(`👤 Username: ${username}`);

    if (existsAfter && username === "TestUser") {
        console.log("🎉 VERIFICATION SUCCESSFUL: Contract is working correctly!");
    } else {
        console.error("❌ VERIFICATION FAILED: State not updated correctly.");
        process.exit(1);
    }
}

main().catch(console.error);
