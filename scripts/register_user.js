import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // Connect to Localhost
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Use Account #0 (Deployer/Admin usually)
    const signer = await provider.getSigner(0);
    console.log(`📝 Registering with account: ${signer.address}`);

    // Get Contract Address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("❌ Contract address file not found.");
        process.exit(1);
    }
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    // Get Artifact
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found.");
        process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Connect to Contract
    const chatApp = new ethers.Contract(contractAddress, artifact.abi, signer);

    // Check if already registered
    const exists = await chatApp.checkUserExists(signer.address);
    if (exists) {
        const username = await chatApp.getUsername(signer.address);
        console.log(`✅ User already registered as: ${username}`);
    } else {
        console.log("⏳ Creating account for 'Ashwin'...");
        const tx = await chatApp.createAccount("Ashwin");
        await tx.wait();
        console.log("✅ Account created successfully!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
