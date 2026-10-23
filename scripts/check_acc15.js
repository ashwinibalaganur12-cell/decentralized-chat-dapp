import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // Connect to localhost directly
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Get Account #15
    const acc15 = await provider.getSigner(15);

    // Contract details
    const addressPath = path.join(__dirname, "../contract_address.txt");
    let contractAddress;

    if (fs.existsSync(addressPath)) {
        contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    } else {
        contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e"; // Fallback
    }
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");

    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found. Run 'npx hardhat compile' first.");
        process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const chatApp = new ethers.Contract(contractAddress, artifact.abi, acc15);

    try {
        const exists = await chatApp.checkUserExists(acc15.address);
        if (exists) {
            const username = await chatApp.getUsername(acc15.address);
            console.log(`Account #15 is REGISTERED as: ${username}`);
        } else {
            console.log("Account #15 is NOT REGISTERED");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
