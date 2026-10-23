import hre from "hardhat";

async function main() {
    const addresses = [
        "0x8464135c8F25Da09e49BC8782676a84730C318bC",
        "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
    ];

    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const signers = await hre.ethers.getSigners();

    // Define new users to register
    // Account #3, #4, #5
    const newUsers = [
        { signer: signers[3], name: "Charlie" },
        { signer: signers[4], name: "David" },
        { signer: signers[5], name: "Eve" }
    ];

    // Try to find the correct contract deployment
    let chatApp;
    for (const addr of addresses) {
        try {
            const contract = ChatApp.attach(addr).connect(signers[0]);
            await contract.getAllAppUser();
            chatApp = contract;
            console.log(`Connected to contract at ${addr}`);
            break;
        } catch (e) {
            // ignore
        }
    }

    if (!chatApp) {
        console.error("Could not connect to any ChatApp contract.");
        // Fallback: try to attach to the one from config if simple attach works? 
        // But the loop covers the likely ones.
        return;
    }

    console.log("\n--- Registering New Users ---");
    const registeredUsers = [];

    for (const user of newUsers) {
        const userContract = chatApp.connect(user.signer);
        try {
            const exists = await userContract.checkUserExists(user.signer.address);
            if (!exists) {
                process.stdout.write(`Registering ${user.name}... `);
                const tx = await userContract.createAccount(user.name);
                await tx.wait();
                console.log("Success!");
            } else {
                console.log(`${user.name} is already registered.`);
            }
            registeredUsers.push({ name: user.name, address: user.signer.address });
        } catch (error) {
            console.error(`Error registering ${user.name}:`, error.message);
        }
    }

    // Output all for the user to see easily
    console.log("\n--- details for your clipboard ---");
    registeredUsers.forEach(u => {
        console.log(`Name: ${u.name}`);
        console.log(`Address: ${u.address}`);
        console.log("---");
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
