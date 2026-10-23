import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // 1. Get Contract Address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("❌ contract_address.txt not found!");
        process.exit(1);
    }
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    console.log(`📍 Using Contract Address: ${contractAddress}`);

    // 2. Define Accounts to Register
    // Indices from HARDHAT_ACCOUNTS.txt
    const accountsToRegister = [
        { index: 5, name: "Alice_5" },
        { index: 6, name: "Bob_6" },
        { index: 7, name: "Charlie_7" }
    ];

    const signers = await hre.ethers.getSigners();
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");

    console.log("🚀 Starting bulk registration...");

    for (const acc of accountsToRegister) {
        const signer = signers[acc.index];
        if (!signer) {
            console.log(`⚠️ Account #${acc.index} not found. Skipping.`);
            continue;
        }

        const chatApp = ChatApp.attach(contractAddress).connect(signer);

        try {
            const exists = await chatApp.checkUserExists(signer.address);

            if (!exists) {
                console.log(`📝 Registering Account #${acc.index} (${signer.address}) as '${acc.name}'...`);
                const tx = await chatApp.createAccount(acc.name);
                await tx.wait();
                console.log(`✅ Registered '${acc.name}'!`);
            } else {
                const existingName = await chatApp.getUsername(signer.address);
                console.log(`ℹ️ Account #${acc.index} already registered as '${existingName}'`);
            }
        } catch (err) {
            console.error(`❌ Failed to register Account #${acc.index}:`, err.message);
        }
    }
    console.log("✨ Done!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
