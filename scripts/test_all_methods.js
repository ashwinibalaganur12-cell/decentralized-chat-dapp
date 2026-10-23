import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log("🚀 Testing all contract methods...");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Load address
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const address = fs.readFileSync(addressPath, "utf8").trim();
    console.log(`Contract: ${address}`);

    // Load artifact
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    const contract = new ethers.Contract(address, abi, provider);
    const signer = await provider.getSigner(0); // 0xf39...
    const connectedContract = contract.connect(signer);

    // 1. checkUserExists
    try {
        console.log("1. checkUserExists...");
        await contract.checkUserExists(signer.address);
        console.log("   ✅ OK");
    } catch (e) {
        console.log("   ❌ Error:", e.shortMessage || e.message);
    }

    // 2. getAllAppUser
    try {
        console.log("2. getAllAppUser...");
        await contract.getAllAppUser();
        console.log("   ✅ OK");
    } catch (e) {
        console.log("   ❌ Error:", e.shortMessage || e.message);
    }

    // 3. getUsername (Expect Revert if not registered)
    try {
        console.log("3. getUsername...");
        await contract.getUsername(signer.address);
        console.log("   ✅ OK (Unexpected if not registered)");
    } catch (e) {
        console.log("   ⚠️ Reverted as expected (or error):", e.shortMessage || e.message);
    }

    // 4. getMyFriendList
    try {
        console.log("4. getMyFriendList...");
        await connectedContract.getMyFriendList(); // Requires msg.sender
        console.log("   ✅ OK");
    } catch (e) {
        console.log("   ❌ Error:", e.shortMessage || e.message);
    }

    // 5. getMyGroups
    try {
        console.log("5. getMyGroups...");
        // This requires checkUserExists according to Solidity?
        // function getMyGroups() external view returns (Group[] memory) { require(checkUserExists(msg.sender)... }
        // So this should REVERT if account 0 is not created.
        await connectedContract.getMyGroups();
        console.log("   ✅ OK");
    } catch (e) {
        console.log("   ⚠️ Reverted as expected (User not created):", e.shortMessage || e.message);
    }

    // 6. readMessage
    try {
        console.log("6. readMessage...");
        // function readMessage(address friend_key)
        await connectedContract.readMessage("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
        console.log("   ✅ OK");
    } catch (e) {
        console.log("   ❌ Error:", e.shortMessage || e.message);
    }

    console.log("Done.");
}

main();
