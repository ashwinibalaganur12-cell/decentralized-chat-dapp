
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Scanning all accounts...");

    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const accounts = await provider.listAccounts();

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));

    // Create a read-only contract instance first
    const contractReader = new ethers.Contract(contractAddress, artifact.abi, provider);

    for (const account of accounts) {
        // Check if registered
        try {
            const isRegistered = await contractReader.checkUserExists(account.address);
            if (isRegistered) {
                const username = await contractReader.getUsername(account.address);
                console.log(`\n✅ [${username}] (${account.address}) is REGISTERED.`);

                // Get signer to call getMyGroups (which uses msg.sender)
                const signer = await provider.getSigner(account.address);
                const contractSigner = new ethers.Contract(contractAddress, artifact.abi, signer);

                try {
                    const groups = await contractSigner.getMyGroups();
                    if (groups.length > 0) {
                        console.log(`   📂 Groups (${groups.length}):`);
                        groups.forEach(g => console.log(`      - "${g.name}" (ID: ${g.groupId})`));
                    } else {
                        console.log(`   📂 No groups.`);
                    }
                } catch (err) {
                    console.log(`   ❌ Could not fetch groups: ${err.message}`);
                }

            }
        } catch (e) {
            // Ignore errors for unregistered checks
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
