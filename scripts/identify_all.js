import hre from "hardhat";

async function main() {
    // Address from src/config/contract.js
    const contractAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    // We can attach to any signer, default is the first one
    const chatApp = ChatApp.attach(contractAddress);

    try {
        console.log(`Connecting to contract at ${contractAddress}...`);
        const allUsers = await chatApp.getAllAppUser();

        console.log("\n--- Registered Users ---");
        const results = [];
        if (allUsers.length === 0) {
            console.log("No registered users found.");
        } else {
            allUsers.forEach((user, index) => {
                console.log(`${index + 1}. Name: ${user.name}, Address: ${user.accountAddress}`);
                results.push({ name: user.name, address: user.accountAddress });
            });
        }

        const fs = await import("fs");
        fs.writeFileSync("users.json", JSON.stringify(results, null, 2));
        console.log("Results written to users.json");

    } catch (error) {
        console.error("Error fetching users with primary address:", error.message);

        // Fallback to address seen in check_acc15.js
        const contractAddressBackup = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";
        console.log(`\nRetrying with backup address ${contractAddressBackup}...`);

        const chatAppBackup = ChatApp.attach(contractAddressBackup);
        try {
            const allUsersBackup = await chatAppBackup.getAllAppUser();
            console.log("\n--- Registered Users (Backup Address) ---");
            const results = [];
            if (allUsersBackup.length === 0) {
                console.log("No registered users found.");
            } else {
                allUsersBackup.forEach((user, index) => {
                    console.log(`${index + 1}. Name: ${user.name}, Address: ${user.accountAddress}`);
                    results.push({ name: user.name, address: user.accountAddress });
                });
            }
            const fs = await import("fs");
            fs.writeFileSync("users.json", JSON.stringify(results, null, 2));
            console.log("Results written to users.json");
        } catch (e) {
            console.error("Backup address also failed:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
