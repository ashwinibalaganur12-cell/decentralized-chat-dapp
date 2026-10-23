const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Reproducing Error to inspect JSON structure...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get a signer (User 1)
    const signer = await provider.getSigner(0);
    console.log(`Using account: ${signer.address}`);

    // 2. Read Contract
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();

    const contract = new ethers.Contract(contractAddress, artifact.abi, signer);

    try {
        // 3. Try to create account "UserOne" AGAIN (should fail)
        console.log("Attempting to create duplicate account 'UserOne'...");
        const tx = await contract.createAccount("UserOne");
        await tx.wait();
        console.log("❌ Unexpected success! Account created (it should have failed).");

    } catch (error) {
        console.log("\n✅ Error caught!");

        // 1. Check for the specific revert message in data
        if (error.info && error.info.error) {
            console.log("error.info.error:", JSON.stringify(error.info.error, null, 2));
        }

        // 2. Check deeply nested properties
        if (error.reason) console.log("error.reason:", error.reason);
        if (error.code) console.log("error.code:", error.code);

        // 3. Check for the invocation error which often holds the string
        if (error.invocation) {
            console.log("error.invocation:", JSON.stringify(error.invocation, null, 2));
        }
    }
}

main();
