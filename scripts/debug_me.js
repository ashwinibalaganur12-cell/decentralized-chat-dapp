
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Starting debug script...");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Read address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.log("No contract address found at", addressPath);
        return;
    }
    const address = fs.readFileSync(addressPath, "utf8").trim();
    console.log("Checking contract at:", address);

    // Read Artifact
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    if (!fs.existsSync(artifactPath)) {
        console.log("No artifact found at", artifactPath);
        return;
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    const contract = new ethers.Contract(address, abi, provider);

    try {
        console.log("Calling getAllAppUser()...");
        const users = await contract.getAllAppUser();
        console.log("getAllAppUser success. Users count:", users.length);
    } catch (e) {
        console.error("getAllAppUser failed:", e);
    }

    try {
        console.log("Calling checkUserExists(deployer)...");
        // Get signers to have a valid address to check
        const signer = await provider.getSigner(0); // Account 0
        console.log("Signer:", signer.address);
        const exists = await contract.checkUserExists(signer.address);
        console.log("checkUserExists success. Exists:", exists);
    } catch (e) {
        console.error("checkUserExists failed:", e);
    }
}

main();
