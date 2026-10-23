import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();

    // User16 is "hardhat1" (Account #16)
    const user16 = signers[16];

    // Friends to add:
    const bob = signers[1];      // Bob
    const user18 = signers[18];  // User18
    const user19 = signers[19];  // User19
    // User17 is already shown in screenshot, but we can double check
    const user17 = signers[17];

    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(contractAddress).connect(user16);

    console.log(`🚀 Setting up friends for User16 (${user16.address})...`);

    const friendsToAdd = [
        { signer: bob, name: "Bob" },
        { signer: user18, name: "User18" },
        { signer: user19, name: "User19" },
        { signer: user17, name: "User17" }
    ];

    for (const friend of friendsToAdd) {
        try {
            console.log(`➕ Adding ${friend.name} (${friend.signer.address})...`);
            // Try adding friend
            const tx = await chatApp.addFriend(friend.signer.address, friend.name);
            await tx.wait();
            console.log(`✅ Added ${friend.name}`);
        } catch (error) {
            if (error.message.includes("already friends")) {
                console.log(`ℹ️  Already friends with ${friend.name}`);
            } else {
                console.log(`⚠️  Could not add ${friend.name}: ${error.message}`);
                // It might fail if they are trying to add themselves or are not registered, 
                // but we know they are registered from previous steps.
            }
        }
    }
    console.log("\n✨ Done! User16 should now see all these friends.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
