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

    // 2. Get Account #4
    const signers = await hre.ethers.getSigners();
    const account4 = signers[4];
    console.log(`👤 Processing Account #4: ${account4.address}`);

    // 3. Connect to Contract
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(contractAddress).connect(account4);

    // 4. Check and Register
    const exists = await chatApp.checkUserExists(account4.address);

    if (!exists) {
        console.log("📝 Registering as 'Account4'...");
        const tx = await chatApp.createAccount("Account4");
        await tx.wait();
        console.log("✅ Successfully registered 'Account4'!");
    } else {
        const name = await chatApp.getUsername(account4.address);
        console.log(`ℹ️ Already registered as '${name}'`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
