import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();
    // Indices 16, 17, 18, 19
    const indices = [16, 17, 18, 19];

    // Valid contract address from previous context
    const contractAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");

    // Attach to contract (using first signer, doesn't matter for view calls)
    const chatApp = ChatApp.attach(contractAddress).connect(signers[0]);

    console.log("Checking registration status for your imported accounts...");
    console.log("---------------------------------------------------------");

    for (const i of indices) {
        const signer = signers[i];
        if (!signer) {
            console.log(`Account #${i} not found in Hardhat node.`);
            continue;
        }

        try {
            const exists = await chatApp.checkUserExists(signer.address);
            if (exists) {
                const username = await chatApp.getUsername(signer.address);
                console.log(`[Account #${i}] ${signer.address} is REGISTERED as: '${username}'`);
            } else {
                console.log(`[Account #${i}] ${signer.address} is NOT REGISTERED`);
            }
        } catch (error) {
            console.error(`Error checking Account #${i}:`, error.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
