import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();
    const acc0 = signers[0]; // Sender in your logs
    const acc18 = signers[18]; // The address you pasted in the screenshot (0xDd2...)

    // Address you see in terminal logs
    const contractAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = ChatApp.attach(contractAddress).connect(acc0);

    console.log("🔍 Debugging Account State...");

    // 1. Check Sender (Account #0)
    try {
        const name0 = await chatApp.getUsername(acc0.address);
        console.log(`✅ Sender (Account #0) is registered as: '${name0}'`);
    } catch {
        console.log(`❌ Sender (Account #0) is NOT registered.`);
    }

    // 2. Check Friend (Account #18)
    try {
        const name18 = await chatApp.getUsername(acc18.address);
        console.log(`✅ Friend (Account #18) is registered as: '${name18}'`);
    } catch {
        console.log(`❌ Friend (Account #18) is NOT registered.`);
    }

    // 3. Check Friendship
    // The contract doesn't have a direct "checkAlreadyFriends" public function usually,
    // so we assume if both are registered, the revert might be "Already Friends".
    // We can list friends to see.
    try {
        const friends = await chatApp.getMyFriendList();
        const isFriend = friends.some(f => f.pubkey === acc18.address);
        if (isFriend) {
            console.log(`⚠️  Account #18 is ALREADY in your friend list!`);
            console.log("   (This explains the revert: You cannot add the same friend twice.)");
        } else {
            console.log(`ℹ️  Account #18 is NOT in your friend list yet.`);
        }
    } catch (err) {
        console.log("Error fetching friend list:", err.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
