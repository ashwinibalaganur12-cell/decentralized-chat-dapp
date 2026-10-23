
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));

    // Check both Account #0 and #4
    const indices = [0, 4];

    for (const i of indices) {
        try {
            const signer = await provider.getSigner(i);
            console.log(`\n-----------------------------------------------------------`);
            console.log(`👤 Checking Account #${i}: ${signer.address}`);

            const contract = new ethers.Contract(contractAddress, artifact.abi, signer);
            const isRegistered = await contract.checkUserExists(signer.address);

            console.log(`   Registered status: ${isRegistered}`);

            if (isRegistered) {
                const name = await contract.getUsername(signer.address);
                console.log(`   Username: "${name}"`);

                const groups = await contract.getMyGroups();
                console.log(`   Groups found: ${groups.length}`);

                if (groups.length > 0) {
                    groups.forEach((g, idx) => {
                        console.log(`     [${idx + 1}] Name: "${g.name}", ID: ${g.groupId}..., Members: ${g.members.length}`);
                    });
                } else {
                    console.log(`     (No groups returned from contract)`);
                }
            } else {
                console.log(`   (User not registered, cannot have groups)`);
            }
        } catch (err) {
            console.log(`   ❌ Error checking Account #${i}:`, err.message);
        }
    }
    console.log(`\n-----------------------------------------------------------`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
