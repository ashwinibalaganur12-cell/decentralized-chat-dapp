import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();
    // Indices requested by user
    const indices = [16, 17, 18, 19];

    // Contract address
    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");

    console.log("🚀 Starting automatic registration for accounts #16 - #19...");

    for (const i of indices) {
        const signer = signers[i];
        if (!signer) {
            console.log(`⚠️ Account #${i} not found.`);
            continue;
        }

        const chatApp = ChatApp.attach(contractAddress).connect(signer);
        const name = `User${i}`;

        try {
            // 1. Check if registered
            const exists = await chatApp.checkUserExists(signer.address);

            if (!exists) {
                console.log(`\n📝 Registering Account #${i} (${signer.address}) as '${name}'...`);
                const tx = await chatApp.createAccount(name);
                await tx.wait();
                console.log(`✅ Registration successful!`);
            } else {
                const existingName = await chatApp.getUsername(signer.address);
                console.log(`\nℹ️ Account #${i} is already registered as '${existingName}'`);
            }

            // 2. Add 'Bob' (Account #1) as a friend so they have someone to chat with immediately
            const bobSigner = signers[1];
            // Check if already friends
            // We can't view checkAlreadyFriends directly as it is internal, but we can try adding and catch error, 
            // or just rely on UI finding them. Let's try adding Bob.

            if (i !== 1) { // Don't add self
                console.log(`   ➕ Adding Bob (Account #1) as a friend...`);
                try {
                    // Check if Bob is registered first (we know he is, but good practice)
                    const bobExists = await chatApp.checkUserExists(bobSigner.address);
                    if (bobExists) {
                        // We can't easily check 'checkAlreadyFriends' from here without a view function,
                        // so we just try-catch the transaction.
                        const txFriend = await chatApp.addFriend(bobSigner.address, "Bob");
                        await txFriend.wait();
                        console.log(`   ✅ Added Bob as friend.`);
                    }
                } catch (err) {
                    if (err.message.includes("already friends")) {
                        console.log(`   ℹ️ Already friends with Bob.`);
                    } else {
                        // Ignore other errors (maybe Bob isn't registered yet in a fresh run)
                        // console.log(`   ⚠️ Could not add Bob: ${err.message}`);
                    }
                }
            }

        } catch (error) {
            console.error(`❌ Failed processing Account #${i}:`, error.message);
        }
    }

    console.log("\n✨ All Done! specific accounts are registered.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
