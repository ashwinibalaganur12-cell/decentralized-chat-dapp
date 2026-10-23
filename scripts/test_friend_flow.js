const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Testing Friend Flow...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer1 = await provider.getSigner(0); // Account 1
    const signer2 = await provider.getSigner(1); // Account 2

    // Read ABI and Address
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const contractAddress = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();

    const contract1 = new ethers.Contract(contractAddress, artifact.abi, signer1);
    const contract2 = new ethers.Contract(contractAddress, artifact.abi, signer2);

    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Account 1: ${signer1.address}`);
    console.log(`Account 2: ${signer2.address}`);

    try {
        // 0. Check if Account 1 is registered
        let isUser1 = await contract1.checkUserExists(signer1.address);
        console.log(`Is Account 1 registered? ${isUser1}`);
        if (!isUser1) {
            console.log("Creating account for User 1...");
            const tx = await contract1.createAccount("UserOne");
            await tx.wait();
            console.log("✅ User 1 registered");
        }

        // 1. Check if Account 2 is registered
        let isUser2 = await contract1.checkUserExists(signer2.address);

        console.log(`Is Account 2 registered? ${isUser2}`);

        if (!isUser2) {
            console.log("Creating account for User 2...");
            const tx = await contract2.createAccount("UserTwo");
            await tx.wait();
            console.log("✅ User 2 registered");
        }

        // 2. Check friend status
        console.log("Checking if User 2 is already a friend...");
        const currentFriends = await contract1.getMyFriendList();
        const isAlreadyFriend = currentFriends.some(f => f.pubkey.toLowerCase() === signer2.address.toLowerCase());

        if (isAlreadyFriend) {
            console.log("⚠️  User 2 is already in User 1's friend list. Skipping addFriend.");
        } else {
            console.log("Adding User 2 as friend for User 1...");
            const tx = await contract1.addFriend(signer2.address, "MyFriendBob");
            await tx.wait();
            console.log("✅ Friend added successfully");
        }

        // 3. Verify
        const friends1 = await contract1.getMyFriendList();
        const isFriend = friends1.some(f => f.pubkey.toLowerCase() === signer2.address.toLowerCase());
        console.log(`Is User 2 in User 1's friend list? ${isFriend}`);

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main();
