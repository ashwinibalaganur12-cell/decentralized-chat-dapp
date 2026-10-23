import hre from "hardhat";

async function main() {
    // 1. Setup Bob (The Receiver)
    const signers = await hre.ethers.getSigners();
    const bob = signers[1]; // Account #1
    const user16 = signers[16]; // Account #16 (The Sender)

    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(contractAddress).connect(bob);

    console.log(`👀 Watching for messages sent to Bob (${bob.address})...`);
    console.log(`Sender: User16 (${user16.address})`);
    console.log("------------------------------------------------------");

    console.log("------------------------------------------------------");

    // Check messages from ALL known accounts
    for (let i = 0; i < 20; i++) {
        if (i === 1) continue; // Skip Bob himself

        const potentialSender = signers[i];

        try {
            const messages = await chatApp.readMessage(potentialSender.address);
            if (messages.length > 0) {
                const count = messages.length;
                const lastMsg = messages[count - 1];
                const date = new Date(Number(lastMsg.timestamp) * 1000).toLocaleTimeString();

                console.log(`\n📬 FOUND ${count} message(s) from Account #${i} (${potentialSender.address}):`);
                console.log(`   Last Message [${date}]: "${lastMsg.content}"`);
                console.log("-----------------------------------");
            }
        } catch (error) {
            // Ignore errors (e.g. not friends)
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
