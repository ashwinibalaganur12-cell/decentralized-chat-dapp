const hre = require("hardhat");

async function main() {
    const fs = require("fs");
    const path = require("path");
    const address = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contract = ChatApp.attach(address);

    console.log(`Checking checkUserExists on ${address}...`);
    try {
        // Check for a random address
        const randomAddress = "0x0000000000000000000000000000000000000000";
        const exists = await contract.checkUserExists(randomAddress);
        console.log(`Call successful! Result: ${exists}`);
    } catch (error) {
        console.error("Call failed:", error);
    }
}

main().catch(console.error);
