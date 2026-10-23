
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Account #4 (Hardhat index 4)
    const signer = await provider.getSigner(4);
    console.log("🔍 Checking Account #4:", signer.address);

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    try {
        const isRegistered = await contract.checkUserExists(signer.address);
        console.log(`Registered? ${isRegistered}`);

        if (isRegistered) {
            const name = await contract.getUsername(signer.address);
            console.log(`Username: ${name}`);

            const groups = await contract.getMyGroups();
            console.log(`Groups Count: ${groups.length}`);

            groups.forEach((g, i) => {
                console.log(`  [${i}] Name: "${g.name}", ID: ${g.groupId}`);
            });
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error);
