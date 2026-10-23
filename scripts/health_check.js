import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // 1. Read Address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();

    // 2. Read ABI
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    console.log(`Checking Contract at: ${contractAddress}`);

    // 3. Connect to Hardhat
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // 4. Call checkUserExists for a random address
    const randomAddress = "0x0000000000000000000000000000000000000000";
    try {
        const exists = await contract.checkUserExists(randomAddress);
        console.log(`✅ Contract Read Success! checkUserExists returns: ${exists}`);
    } catch (e) {
        console.error("❌ Contract Read Failed:", e.message);
    }
}

main();
