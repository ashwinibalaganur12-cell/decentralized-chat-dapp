import hre from "hardhat";
import fs from "fs";

async function main() {
    const address = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
    let output = `Checking contract at ${address}...\n`;

    const code = await hre.ethers.provider.getCode(address);
    output += `Code length: ${code.length}\n`;

    if (code === "0x") {
        output += "❌ No code found at this address! The contract is not deployed there.\n";
        console.log(output);
        fs.writeFileSync("verification_result.txt", output);
        process.exit(1);
    }

    try {
        const ChatApp = await hre.ethers.getContractFactory("ChatApp");
        const contract = ChatApp.attach(address);

        // Try a simple view call
        const users = await contract.getAllAppUser();
        output += `✅ Contract call successful. User count: ${users.length}\n`;
    } catch (error) {
        output += `❌ Contract call failed: ${error.message}\n`;
    }

    console.log(output);
    fs.writeFileSync("verification_result.txt", output);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
