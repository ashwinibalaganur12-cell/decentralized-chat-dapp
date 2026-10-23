import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    const addressPath = path.join(__dirname, "../contract_address.txt");
    if (!fs.existsSync(addressPath)) {
        console.error("❌ contract_address.txt not found. Run deployment first.");
        return;
    }
    const address = fs.readFileSync(addressPath, "utf8").trim();
    console.log(`Target Contract Address: ${address}`);

    let output = "";

    // Helper to log
    const log = (msg) => {
        console.log(msg);
        output += msg + "\n";
    };

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contract = ChatApp.attach(address);

    const [signer] = await hre.ethers.getSigners();
    log(`Calling from: ${signer.address}`);

    try {
        log("1. checkUserExists(signer.address)...");
        const exists = await contract.checkUserExists(signer.address);
        log(`   Result: ${exists}`);
    } catch (e) {
        log(`   Failed: ${e.message}`);
    }

    try {
        log("2. getUsername(signer.address)...");
        const name = await contract.getUsername(signer.address);
        log(`   Result: ${name}`);
    } catch (e) {
        log(`   Failed: ${e.message}`);
    }

    try {
        log("3. readMessage(signer.address)... (self-chat check)");
        const msgs = await contract.readMessage(signer.address);
        log(`   Result: ${msgs.length} messages`);
    } catch (e) {
        log(`   Failed: ${e.message}`);
    }

    // Test Group read with fake ID
    try {
        log("4. readGroupMessages(fakeId)...");
        const fakeId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("FakeGroup"));
        await contract.readGroupMessages(fakeId);
        log(`   Result: Success (unexpected)`);
    } catch (e) {
        log(`   Failed: ${e.message}`);
        if (e.data) log(`   Data: ${e.data}`);
    }

    fs.writeFileSync("debug_calls_output.txt", output);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
