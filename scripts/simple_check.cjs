
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const { ethers } = hre;
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer0 = await provider.getSigner(0);
    const signer1 = await provider.getSigner(1);

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    console.log("Checking Account #0:", signer0.address);
    const isReg0 = await contract.checkUserExists(signer0.address);
    console.log("Acc #0 Registered?", isReg0);
    if (isReg0) {
        const user0 = await contract.getUsername(signer0.address);
        console.log("Username:", user0);
        const contract0 = contract.connect(signer0);
        const groups0 = await contract0.getMyGroups();
        console.log("Groups:", groups0.length);
    }

    console.log("\nChecking Account #1:", signer1.address);
    const isReg1 = await contract.checkUserExists(signer1.address);
    console.log("Acc #1 Registered?", isReg1);
    if (isReg1) {
        const user1 = await contract.getUsername(signer1.address);
        console.log("Username:", user1);
    }
}

main().catch(console.error);
