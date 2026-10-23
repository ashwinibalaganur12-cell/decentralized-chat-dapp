import hre from "hardhat";

async function main() {
    const chatAppAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    console.log(`Checking accounts against contract: ${chatAppAddress}\n`);

    const provider = hre.ethers.provider;
    const code = await provider.getCode(chatAppAddress);
    if (code === "0x") {
        console.log("CRITICAL ERROR: No contract code found at " + chatAppAddress);
        console.log("You likely restarted the Hardhat node but didn't redeploy the contract.");
        console.log("Run: node deploy-and-setup.js");
        process.exit(1);
    } else {
        console.log("Contract code found. Proceeding with account checks...");
    }

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contract = ChatApp.attach(chatAppAddress);

    const accounts = [
        { name: "Account #10", address: "0xBcd4042DE499D14e55001CcbB24a551F3b954096" },
        { name: "Account #11", address: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788" },
        { name: "Account #12", address: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a" }
    ];

    for (const acc of accounts) {
        try {
            const isUser = await contract.checkUserExists(acc.address);
            if (isUser) {
                const username = await contract.getUsername(acc.address);
                console.log(`[REGISTERED] ${acc.name} (${acc.address}) -> Username: "${username}"`);
            } else {
                console.log(`[AVAILABLE]  ${acc.name} (${acc.address})`);
            }
        } catch (error) {
            console.log(`[ERROR]      ${acc.name} (${acc.address}) - Error: ${error.message}`);
        }
    }
}

main().catch(console.error);
