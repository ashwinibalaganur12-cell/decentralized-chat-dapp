import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";

    console.log("Registering first 5 accounts...");

    // Names mapped to account indices
    // 0: Deployer (often already registered as 'Ashwin' or similar)
    // 1: Bob
    // 4: Hardhat4 (Index 4 is usually the 5th account, but user said 'hardhat4', let's stick to index 4)

    for (let i = 0; i < 5; i++) {
        const signer = signers[i];
        const name = i === 1 ? "Bob" : `HardhatUser_${i}`;

        const chatApp = ChatApp.attach(contractAddress).connect(signer);

        try {
            const exists = await chatApp.checkUserExists(signer.address);
            if (!exists) {
                console.log(`Registering ${name} (${signer.address})...`);
                const tx = await chatApp.createAccount(name);
                await tx.wait();
                console.log(`Registered ${name}`);
            } else {
                const registeredName = await chatApp.getUsername(signer.address);
                console.log(`${name} is already registered as '${registeredName}' (${signer.address})`);
            }
        } catch (e) {
            console.error(`Failed to register ${name}:`, e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
