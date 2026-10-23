const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Debugging ChatApp Users...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read ABI and Address
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found. Run 'npx hardhat compile'");
        return;
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();

    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    console.log(`Contract: ${contractAddress}`);

    try {
        const users = await contract.getAllAppUser();
        console.log(`\n📋 Registered Users (${users.length}):`);
        users.forEach((u, i) => {
            console.log(`${i + 1}. Name: ${u.name}, Address: ${u.accountAddress}`);
        });

    } catch (error) {
        console.error("❌ Failed to fetch users:", error);
    }
}

main();
