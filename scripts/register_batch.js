import hre from "hardhat";

async function main() {
    const chatAppAddress = "0x71C95911E9a5D330f4D621842EC243EE1343292e";

    // Accounts to register
    const newUsers = [
        {
            name: "Kevin",
            privateKey: "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61" // Account #15
        },
        {
            name: "Luna",
            privateKey: "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0" // Account #16
        },
        {
            name: "Mike",
            privateKey: "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd" // Account #17
        }
    ];

    console.log(`\n🤖 Batch Registering ${newUsers.length} Users...`);

    const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");

    for (const user of newUsers) {
        const wallet = new hre.ethers.Wallet(user.privateKey, provider);
        const contract = ChatApp.attach(chatAppAddress).connect(wallet);

        console.log(`\n   👤 Processing: ${user.name} (${wallet.address})`);

        // Check if already registered
        const isRegistered = await contract.checkUserExists(wallet.address);
        if (isRegistered) {
            console.log("      ⚠️  Already registered. Skipping.");
            continue;
        }

        // Register
        try {
            const tx = await contract.createAccount(user.name);
            process.stdout.write("      ⏳ Registering...");
            await tx.wait();
            console.log(" ✅ Done!");
        } catch (error) {
            console.error("      ❌ Failed:", error.message);
        }
    }
    console.log("\n✨ Batch registration complete!");
}

main().catch(console.error);
