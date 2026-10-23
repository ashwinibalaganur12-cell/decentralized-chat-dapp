const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Checking Account #4...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 2. Get Account #4
    // Mnemonic: "test test test test test test test test test test test junk"
    // Path: m/44'/60'/0'/0/4
    const mnemonic = "test test test test test test test test test test test junk";
    const wallet = ethers.Wallet.fromPhrase(mnemonic, { path: "m/44'/60'/0'/0/4" });

    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);

    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    try {
        const exists = await contract.checkUserExists(wallet.address);
        if (exists) {
            const name = await contract.getUsername(wallet.address);
            console.log(`⚠️ ALREADY REGISTERED as "${name}"`);
        } else {
            console.log("✅ CLEAN (Not registered). Ready for manual use.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
