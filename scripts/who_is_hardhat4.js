const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Searching for 'hardhat4'...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Connect as mostly anyone, just for reading
    const signer = await provider.getSigner(0);

    // Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    const allUsers = await contract.getAllAppUser();
    console.log(`Total Users: ${allUsers.length}`);

    let targetFound = false;
    for (const user of allUsers) {
        console.log(`   - ${user.name} (${user.accountAddress})`);
        if (user.name.toLowerCase() === "hardhat4") {
            targetFound = true;
            console.log("\n🎯 FOUND 'hardhat4'!");
            console.log(`   Address: ${user.accountAddress}`);

            // Check if this is Account 0
            const acc0 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            if (user.accountAddress.toLowerCase() === acc0.toLowerCase()) {
                console.log("   --> This matches Hardhat Account #0 (Deployer)!");
            }
        }
    }

    if (!targetFound) {
        console.log("\n❌ 'hardhat4' not found in user list.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
