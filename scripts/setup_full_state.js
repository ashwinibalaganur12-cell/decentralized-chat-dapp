const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting Full Persistence Setup...");

    // We will use the deployment address directly
    // const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const fs = require('fs');
    const path = require('path');
    const contractAddress = fs.readFileSync(path.join(__dirname, '../contract_address.txt'), 'utf8').trim();
    console.log(`Using contract address: ${contractAddress}`);
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");

    // Get all signers (accounts)
    const signers = await hre.ethers.getSigners();

    // Define our "Permanent" users
    // Account 0 is usually YOU (the developer)
    const users = [
        { index: 0, name: "Deployer", address: signers[0].address },
        { index: 1, name: "Alice", address: signers[1].address },
        { index: 2, name: "Bob", address: signers[2].address },
        { index: 3, name: "Charlie", address: signers[3].address },
        { index: 4, name: "David", address: signers[4].address },
        { index: 5, name: "Eve", address: signers[5].address }
    ];

    console.log("📝 Registering Users...");
    for (const user of users) {
        const signer = signers[user.index];
        const contract = ChatApp.attach(contractAddress).connect(signer);

        try {
            const exists = await contract.checkUserExists(user.address);
            if (!exists) {
                process.stdout.write(`   Registering ${user.name}... `);
                const tx = await contract.createAccount(user.name);
                await tx.wait();
                console.log("✅");
            } else {
                console.log(`   ${user.name} is already registered.`);
            }
        } catch (error) {
            console.log(`   ❌ Failed to register ${user.name}: ${error.message}`);
        }
    }

    console.log("\n🤝 Creating Friendships...");
    // Create a web of friends
    // Alice <-> Bob
    await addFriendship(ChatApp, contractAddress, signers[1], signers[2], "Bob", "Alice");
    // Alice <-> Charlie
    await addFriendship(ChatApp, contractAddress, signers[1], signers[3], "Charlie", "Alice");
    // Bob <-> Charlie
    await addFriendship(ChatApp, contractAddress, signers[2], signers[3], "Charlie", "Bob");

    console.log("\n💬 Sending Welcome Messages...");
    // Alice -> Bob
    await sendMessage(ChatApp, contractAddress, signers[1], signers[2], "Hey Bob! Long time no see.");
    // Bob -> Alice
    await sendMessage(ChatApp, contractAddress, signers[2], signers[1], "Hi Alice! Yeah, how have you been?");
    // Charlie -> Alice
    await sendMessage(ChatApp, contractAddress, signers[3], signers[1], "Hello Alice, this is Charlie.");

    console.log("\n✨ Setup Complete! The blockchain now has persistent-like data.");
}

async function addFriendship(Factory, address, signerA, signerB, nameB, nameA) {
    const contractA = Factory.attach(address).connect(signerA);

    try {
        process.stdout.write(`   ${nameA} adding ${nameB}... `);
        const tx = await contractA.addFriend(signerB.address, nameB);
        await tx.wait();
        console.log("✅");
    } catch (error) {
        // Handle "already friends" or other reverts gracefully
        if (error.message.includes("already friends") || (error.reason && error.reason.includes("already friends"))) {
            console.log(`   (Already friends)`);
        } else {
            // Log the error but don't stop the script (allows other operations to try)
            // console.log(`   ❌ Error adding friend: ${error.message}`);
            console.log(`   ❌ Failed to add: ${error.reason || error.message}`);
        }
    }
}

async function sendMessage(Factory, address, senderSigner, receiverSigner, message) {
    const contract = Factory.attach(address).connect(senderSigner);
    try {
        const tx = await contract.sendMessage(receiverSigner.address, message);
        await tx.wait();
        console.log(`   ✉️  ${senderSigner.address.slice(0, 6)} -> ${receiverSigner.address.slice(0, 6)}: "${message}"`);
    } catch (error) {
        console.log(`   ❌ Error sending message: ${error.message}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
