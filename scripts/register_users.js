import hre from "hardhat";

async function main() {
    const addresses = [
        "0x8464135c8F25Da09e49BC8782676a84730C318bC",
        "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
    ];

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const signers = await hre.ethers.getSigners();
    const bob = signers[1];
    const alice = signers[2];

    // Try to find the correct contract deployment
    let chatApp;
    for (const addr of addresses) {
        try {
            const contract = ChatApp.attach(addr).connect(bob);
            // Try a read call to check if it exists
            await contract.getAllAppUser();
            chatApp = contract;
            console.log(`Connected to contract at ${addr}`);
            break;
        } catch (e) {
            console.log(`Could not connect to ${addr}`);
        }
    }

    if (!chatApp) {
        console.error("Could not connect to any ChatApp contract.");
        return;
    }

    // Register Bob
    console.log(`Checking registration for Bob (${bob.address})...`);
    try {
        const exists = await chatApp.checkUserExists(bob.address);
        if (!exists) {
            console.log("Registering Bob...");
            const tx = await chatApp.createAccount("Bob");
            await tx.wait();
            console.log("Bob registered successfully!");
        } else {
            console.log("Bob is already registered.");
        }
    } catch (error) {
        console.error("Error registering Bob:", error.message);
    }

    // Also Register Alice just in case
    const chatAppAlice = chatApp.connect(alice);
    console.log(`Checking registration for Alice (${alice.address})...`);
    try {
        const exists = await chatAppAlice.checkUserExists(alice.address);
        if (!exists) {
            console.log("Registering Alice...");
            const tx = await chatAppAlice.createAccount("Alice");
            await tx.wait();
            console.log("Alice registered successfully!");
        } else {
            console.log("Alice is already registered.");
        }
    } catch (error) {
        console.error("Error registering Alice:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
