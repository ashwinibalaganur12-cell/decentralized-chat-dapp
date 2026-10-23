import hre from "hardhat";

async function main() {
    const chatAppAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";
    const friendPrivateKey = "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82"; // Account #11
    const friendName = "Grace";

    console.log(`\n🤖 Auto-registering Friend: ${friendName}...`);

    // 1. Setup Provider & Signer
    const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new hre.ethers.Wallet(friendPrivateKey, provider);

    console.log(`   Address: ${wallet.address}`);

    // 2. Connect to Contract
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contract = ChatApp.attach(chatAppAddress).connect(wallet);

    // 3. Check if already registered
    const isRegistered = await contract.checkUserExists(wallet.address);
    if (isRegistered) {
        console.log("   ⚠️  Already registered!");
        return;
    }

    // 4. Register
    try {
        const tx = await contract.createAccount(friendName);
        console.log("   ⏳ Transaction sent... waiting for confirmation...");
        await tx.wait();
        console.log("   ✅ SUCCESS! Friend registered.");
    } catch (error) {
        console.error("   ❌ Failed to register:", error.message);
    }
}

main().catch(console.error);
