const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const targetAddress = "0x4a1054F8af18b7A41e5f36565c4136E872f1D6A0";
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("❌ Contract address not found.");
        process.exit(1);
    }
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // We can use a random wallet to call read-only functions
    const wallet = ethers.Wallet.createRandom().connect(provider);
    const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

    console.log(`Checking status for: ${targetAddress}`);

    try {
        const exists = await contract.checkUserExists(targetAddress);
        console.log(`User exists: ${exists}`);
        if (exists) {
            const username = await contract.getUsername(targetAddress);
            console.log(`Username: ${username}`);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
