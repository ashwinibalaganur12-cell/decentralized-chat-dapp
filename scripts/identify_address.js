import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // 1. Connect explicitly to Localhost (8545)
    // This avoids using the ephemeral 'hardhat' network if 'hre' is imported
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const addressPath = path.join(__dirname, "../contract_address.txt");
    let chatAppAddress;

    if (fs.existsSync(addressPath)) {
        chatAppAddress = fs.readFileSync(addressPath, "utf8").trim();
    } else {
        chatAppAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e"; // Fallback
    }

    // Use Account #0 (the default deployer) for "From" address if no specific signer is requested
    const signer = await provider.getSigner(0);
    const userAddress = signer.address;

    // Load Artifacts for ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found. Run 'npx hardhat compile' first.");
        process.exit(1);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const contract = new ethers.Contract(chatAppAddress, artifact.abi, signer);

    console.log(`Checking details for addresses...`);
    console.log(`Contract Address (To): ${chatAppAddress}`);
    console.log(`Caller Address (From): ${userAddress}`);

    try {
        const isUser = await contract.checkUserExists(userAddress);
        if (isUser) {
            const username = await contract.getUsername(userAddress);
            console.log(`\nRESULT: The 'From' address (${userAddress}) is registered as user: "${username}"`);
        } else {
            console.log(`\nRESULT: The 'From' address (${userAddress}) is NOT registered in the contract.`);
            console.log("It is likely the default Hardhat Account #0 (often used as Deployer/Admin).");
        }
    } catch (error) {
        console.error("Error querying contract:", error.message);
    }
}

main().catch(console.error);
