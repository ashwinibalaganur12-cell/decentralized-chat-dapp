
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Attempting to reproduce 'Transaction reverted without a reason'...");

    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0); // Account #0

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    // 1. Try reading a non-existent group (should revert WITH reason)
    try {
        const fakeGroupId = ethers.keccak256(ethers.toUtf8Bytes("fake_group"));
        console.log(`\n1. Calling readGroupMessages('${fakeGroupId.slice(0, 10)}...')...`);
        await contract.readGroupMessages(fakeGroupId);
    } catch (e) {
        console.log("   Caught error:", e.shortMessage || e.message);
    }

    // 2. Try calling with invalid argument types (if possible via raw call)
    // 3. Check if user is member of *any* group
    try {
        const groups = await contract.getMyGroups();
        if (groups.length > 0) {
            console.log(`\n2. User has ${groups.length} groups. Trying to read legitimate group...`);
            const gid = groups[0].groupId;
            await contract.readGroupMessages(gid);
            console.log("   Success!");
        } else {
            console.log("\n2. User has NO groups.");
        }
    } catch (e) {
        console.log("   Error checking groups:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
