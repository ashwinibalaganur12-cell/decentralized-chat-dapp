import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log("🚀 Starting standalone deployment...");

    // 1. Connect to the local Hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Check connection
    try {
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
    } catch (error) {
        console.error("❌ Could not connect to Hardhat node. Make sure 'npx hardhat node' is running.");
        process.exit(1);
    }

    // 2. Get the signer (second account to avoid default address blacklist)
    const signer = await provider.getSigner(1);
    console.log(`📝 Deploying with account: ${signer.address}`);

    // 3. Read contract artifacts
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");

    if (!fs.existsSync(artifactPath)) {
        console.error(`❌ Artifact not found at ${artifactPath}. Run 'npx hardhat compile' first.`);
        process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    // 4. Deploy contract
    console.log("⏳ Deploying ChatApp contract...");
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    try {
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();
        console.log(`\n✅ ChatApp deployed to ${contractAddress}`);

        // Save address to file for easy retrieval
        fs.writeFileSync(
            path.join(__dirname, "../contract_address.txt"),
            contractAddress,
            "utf8"
        );

        // AUTO-UPDATE: Update src/config/contract.js with the new address
        const configPath = path.join(__dirname, "../src/config/contract.js");
        if (fs.existsSync(configPath)) {
            let configContent = fs.readFileSync(configPath, "utf8");
            // Replace the contract address in the config file
            const addressRegex = /(export const CONTRACT_ADDRESS = import\.meta\.env\.VITE_CONTRACT_ADDRESS \|\| )"0x[a-fA-F0-9]+"/;
            configContent = configContent.replace(addressRegex, `$1"${contractAddress}"`);
            fs.writeFileSync(configPath, configContent, "utf8");
            console.log(`✅ Updated src/config/contract.js with new address`);
        }

        // Output for the parent script to capture
        console.log(`ChatApp deployed to ${contractAddress}`);

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main();
