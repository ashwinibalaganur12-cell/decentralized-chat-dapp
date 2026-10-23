
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Group Chat Test (CommonJS .cjs)...");

    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Account 0: Ashwin (Already registered)
    const ashwin = await provider.getSigner(0);
    // Account 1: Bob
    const bob = await provider.getSigner(1);

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));

    const contract = new ethers.Contract(contractAddress, artifact.abi, ashwin);
    const contractBob = new ethers.Contract(contractAddress, artifact.abi, bob);

    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Ashwin: ${ashwin.address}`);
    console.log(`Bob: ${bob.address}`);

    // Register Bob if needed
    try {
        const bobUser = await contractBob.getUsername(bob.address);
        console.log(`Bob is already registered as: ${bobUser}`);
    } catch (error) {
        console.log("Registering Bob...");
        await contractBob.createAccount("Bob");
        console.log("Bob registered.");
    }

    // Create Group
    const groupName = "Dev Team " + Date.now();
    console.log(`Ashwin creating group: '${groupName}' with Bob...`);

    const tx = await contract.createGroup(groupName, [bob.address]);
    await tx.wait();
    console.log("✅ Group created.");

    // Get My Groups
    const myGroups = await contract.getMyGroups();
    const latestGroup = myGroups[myGroups.length - 1]; // Assuming order
    const groupId = latestGroup.groupId;

    console.log(`Group ID: ${groupId}`);
    console.log(`Group Name: ${latestGroup.name}`);

    // Send Group Message
    console.log("Ashwin sending message to group...");
    const msgTx = await contract.sendGroupMessage(groupId, "Hello Team!");
    await msgTx.wait();
    console.log("✅ Message sent.");

    // Bob Reads Messages
    console.log("Bob reading group messages...");
    const messages = await contractBob.readGroupMessages(groupId);

    if (messages.length > 0) {
        console.log(`✅ Bob received ${messages.length} message(s).`);
        console.log(`Latest Message: ${messages[messages.length - 1].content}`);

        if (messages[messages.length - 1].content === "Hello Team!") {
            console.log("🎉 VERIFICATION SUCCESS: Message content matches.");
        } else {
            console.error("❌ VERIFICATION FAILED: Content mismatch.");
        }
    } else {
        console.error("❌ VERIFICATION FAILED: No messages received.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
