
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Checking groups for Account #0 (Ashwin)...");

    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0); // Account #0

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));

    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    try {
        const groups = await contract.getMyGroups();
        console.log(`\n📋 Found ${groups.length} groups for ${signer.address}:`);

        groups.forEach((group, index) => {
            console.log(`\nGroup #${index + 1}:`);
            console.log(`  ID: ${group.groupId}`);
            console.log(`  Name: ${group.name}`);
            console.log(`  Members: ${group.members.join(", ")}`);
        });

        if (groups.length === 0) {
            console.log("\n❌ No groups found on-chain. Creation might have failed or not completed.");
        }

    } catch (error) {
        console.error("❌ Error fetching groups:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
