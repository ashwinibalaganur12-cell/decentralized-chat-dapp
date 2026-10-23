import hre from "hardhat";

async function main() {
    console.log("🔍 Checking Bob's Inbox for messages from 'hardhat1' (Account #13)...");

    const signers = await hre.ethers.getSigners();
    const bob = signers[1];      // Receiver
    const hardhat1 = signers[13]; // Sender (likely user)

    // Also check Account #16 just in case
    const user16 = signers[16];

    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(contractAddress).connect(bob);

    // 1. Check from Account #13
    try {
        const msgs = await chatApp.readMessage(hardhat1.address);
        console.log(`\n📨 Messages from Account #13 (${hardhat1.address}): ${msgs.length}`);
        msgs.forEach(m => console.log(`   > "${m.content}"`));
    } catch (e) { console.log("   (No conversation found)"); }

    // 2. Check from Account #16
    try {
        const msgs16 = await chatApp.readMessage(user16.address);
        console.log(`\n📨 Messages from Account #16 (${user16.address}): ${msgs16.length}`);
        msgs16.forEach(m => console.log(`   > "${m.content}"`));
    } catch (e) { console.log("   (No conversation found)"); }

    console.log("\n✅ Check complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
