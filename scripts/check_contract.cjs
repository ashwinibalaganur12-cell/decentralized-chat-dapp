const hre = require("hardhat");

async function main() {
    const address = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const code = await hre.ethers.provider.getCode(address);
    console.log(`Checking address: ${address}`);
    console.log(`Code result: ${code.slice(0, 50)}...`);

    if (code === "0x") {
        console.log("❌ NO contract code found. Address is empty.");
    } else {
        console.log("✅ Contract code found.");

        // Try to call checkUserExists
        try {
            const ChatApp = await hre.ethers.getContractAt("ChatApp", address);
            const userExists = await ChatApp.checkUserExists("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"); // Account 0
            console.log(`checkUserExists result: ${userExists}`);
        } catch (error) {
            console.error("Error calling checkUserExists:", error);
        }
    }
}

main().catch(console.error);
