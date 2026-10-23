const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Initializing Test Users...");

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

    // Helper to register a user
    const registerUser = async (index, name) => {
        const signer = await provider.getSigner(index);
        const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

        console.log(`\n👤 Processing Account #${index} (${name})...`);
        console.log(`   Address: ${signer.address}`);

        try {
            // Check if already registered
            const exists = await contract.checkUserExists(signer.address);
            if (exists) {
                console.log("   ✅ Already registered.");
            } else {
                console.log("   📝 Registering...");
                const tx = await contract.createAccount(name);
                await tx.wait();
                console.log("   ✅ Registration complete!");
            }
        } catch (error) {
            console.error("   ❌ Error:", error.message);
        }
    };

    // Register Account #1 and #2 (Account #0 is usually the user/deployer)
    await registerUser(1, "Test User 2");
    await registerUser(2, "Test User 3");

    console.log("\n✨ Done! You can now import these accounts to MetaMask.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
