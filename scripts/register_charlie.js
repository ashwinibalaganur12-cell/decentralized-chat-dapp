const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Registering New Friend (Charlie)...");

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

    // Register Account #3 (Index 3)
    // Account #0, #1, #2 are likely used. Let's use #3.
    const signer = await provider.getSigner(3);
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    console.log(`\n👤 Processing Account #3...`);
    console.log(`   Address: ${signer.address}`);

    try {
        const exists = await contract.checkUserExists(signer.address);
        if (exists) {
            console.log("   ✅ Already registered.");
        } else {
            console.log("   📝 Registering as 'Charlie'...");
            const tx = await contract.createAccount("Charlie");
            await tx.wait();
            console.log("   ✅ Registration complete!");
        }
    } catch (error) {
        console.error("   ❌ Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
