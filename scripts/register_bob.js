
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Registering Bob (Account #1)...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const bob = await provider.getSigner(1);

    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json"), "utf8"));

    const contractBob = new ethers.Contract(contractAddress, artifact.abi, bob);

    try {
        const tx = await contractBob.createAccount("Bob");
        await tx.wait();
        console.log(`✅ Bob registered! Address: ${bob.address}`);
    } catch (error) {
        if (error.message.includes("User already exists")) {
            console.log("✅ Bob is already registered.");
            console.log(`Address: ${bob.address}`);
        } else {
            console.error("❌ Failed to register Bob:", error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
