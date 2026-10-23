import hre from "hardhat";

async function main() {
    const contractAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC"; // From contract_address.txt
    console.log(`Connecting to ChatApp at ${contractAddress}...`);

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = await ChatApp.attach(contractAddress);

    const [signer] = await hre.ethers.getSigners();
    console.log(`Using account: ${signer.address}`);

    // 1. Check if user exists
    const exists = await chatApp.checkUserExists(signer.address);
    console.log(`User exists? ${exists}`);

    if (!exists) {
        console.log("Creating account...");
        const tx = await chatApp.createAccount("DebugUser");
        await tx.wait();
        console.log("Account created.");
    }

    // 2. Create a group
    const groupName = "DebugGroup_" + Math.floor(Math.random() * 1000);
    console.log(`Creating group: ${groupName}`);

    const txGroup = await chatApp.createGroup(groupName, []);
    await txGroup.wait();
    console.log("Group created transaction confirmed.");

    // 3. Get groups
    console.log("Fetching my groups...");
    const groups = await chatApp.getMyGroups();
    console.log("Raw groups result:", groups);

    if (groups.length > 0) {
        console.log(`Found ${groups.length} groups.`);
        groups.forEach((g, i) => {
            console.log(`Group ${i}:`);
            console.log(`  ID: ${g.groupId}`);
            console.log(`  Name: ${g.name}`);
            console.log(`  Members: ${g.members}`);
        });
    } else {
        console.log("NO GROUPS FOUND! The contract logic might be failing to assign the group to the creator.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
