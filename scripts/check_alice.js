const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const aliceAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    console.log(`🔍 Checking status for Alice: ${aliceAddress}`);

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read contract address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    // Read ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    try {
        const exists = await contract.checkUserExists(aliceAddress);
        if (exists) {
            const name = await contract.getUsername(aliceAddress);
            console.log(`✅ Alice Exists! Username: ${name}`);
        } else {
            console.log("❌ Alice is NOT registered.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
