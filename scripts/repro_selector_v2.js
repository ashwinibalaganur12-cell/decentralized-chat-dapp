import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("No contract address found");
        return;
    }
    const address = fs.readFileSync(addressPath, "utf8").trim();
    console.log("Contract Address:", address);

    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    const contract = new ethers.Contract(address, abi, provider);

    const targetAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Account 0

    console.log("Calling checkUserExists...");
    try {
        const result = await contract.checkUserExists(targetAddress);
        console.log("Result:", result);
    } catch (error) {
        console.error("Error calling checkUserExists:", error);
    }

    // Also try calling a function that DOES NOT exist to see the error
    console.log("\nCalling nonExistentFunction...");
    try {
        // Raw call using same provider
        const data = ethers.id("nonExistentFunction()").substring(0, 10);
        await provider.call({
            to: address,
            data: data
        });
    } catch (error) {
        console.log("Caught expected error for non-existent function:");
        // console.log(error.shortMessage || error.message); 
        console.log("Error info:", error.info);
    }
}

main();
