const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Verifying Charlie's Status...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Address to check
    const charlieAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

    // Read contract address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    console.log(`📄 Using Contract Address: ${contractAddress}`);

    // Read ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    try {
        console.log(`\nChecking checkUserExists(${charlieAddress})...`);
        const exists = await contract.checkUserExists(charlieAddress);
        console.log(`✅ Result: ${exists}`);

        if (exists) {
            const username = await contract.getUsername(charlieAddress);
            console.log(`👤 Username: "${username}"`);
        } else {
            console.log("❌ User is supposedly NOT registered.");

            // Check if any users exist at all
            console.log("\nDumping all registered users...");
            const allUsers = await contract.getAllAppUser();
            console.log(`Total users found: ${allUsers.length}`);
            allUsers.forEach((u, i) => {
                console.log(`   [${i}] ${u.name} (${u.accountAddress})`);
            });
        }

    } catch (error) {
        console.error("❌ Error querying contract:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
