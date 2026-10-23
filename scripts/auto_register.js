const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Read Address & ABI
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 2. Connect to Hardhat with the first default account (Account #0)
    // This account is pre-funded and unlocked on the node.
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0); // Get Account #0

    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    const myAddress = await signer.getAddress();
    console.log(`🤖 Auto-Registering Account: ${myAddress}`);

    // 3. Check if already registered
    const exists = await contract.checkUserExists(myAddress);
    if (exists) {
        console.log("✅ User already exists! You can just login.");
    } else {
        // 4. Register
        console.log("📝 Registering username 'Ashwin'...");
        const tx = await contract.createAccount("Ashwin");
        await tx.wait();
        console.log("🎉 Registration Successful!");
    }
}

main();
