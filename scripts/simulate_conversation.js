const hre = require("hardhat");

async function main() {
    const signers = await hre.ethers.getSigners();
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const bob = signers[1];
    const user4 = signers[4];

    console.log(`Bob: ${bob.address}`);
    console.log(`User4: ${user4.address}`);

    const bobContract = ChatApp.attach(contractAddress).connect(bob);
    const user4Contract = ChatApp.attach(contractAddress).connect(user4);

    console.log("Checking friendship status...");
    // Check if already friends to avoid reverts
    const bobFriends = await bobContract.getMyFriendList();
    const isBobFriend = bobFriends.some(f => f.pubkey === user4.address);

    if (!isBobFriend) {
        console.log("Adding each other as friends...");
        // Bob adds User4
        let tx = await bobContract.addFriend(user4.address, "Hardhat4");
        await tx.wait();
        console.log("Bob added Hardhat4");

        // User4 adds Bob
        // Note: The contract logic might auto-add mutually, but let's be safe based on typical implementations
        // Checking contract logic: addFriend calls _addFriend for both. So only one tx is needed actually!
        // But usually frontend requires explicit checks. Let's see. 
        // Contract: _addFriend(msg.sender, friend_key, name); AND _addFriend(friend_key, msg.sender, userList[msg.sender].name);
        // So one transaction from Bob adds BOTH to each other's lists.
        // However, the second person won't have set a "nickname" for the first person, they get the default name.
    } else {
        console.log("Already friends.");
    }

    console.log("Bob sending message to Hardhat4...");
    const txMsg = await bobContract.sendMessage(user4.address, "Hello Hardhat4! This is Bob.");
    await txMsg.wait();
    console.log("Message sent!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
