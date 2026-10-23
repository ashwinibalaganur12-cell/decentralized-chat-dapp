const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Checking Friend Status...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Connect as read-only
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    // 2. Identify Users
    const priyaAddress = "0x4a1054F8af18b7A41e5f36565c4136E872f1D6A0"; // Priya
    const aliceAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Alice

    // 3. Helper to get friend list
    // Since getMyFriendList uses msg.sender, we need to impersonate carefully for the view call
    // OR we can just use eth_call with 'from'

    const getFriendsFor = async (userAddress) => {
        // Encode function data
        const data = contract.interface.encodeFunctionData("getMyFriendList", []);

        // Raw call
        const result = await provider.call({
            to: contractAddress,
            data: data,
            from: userAddress
        });

        // Decode result
        const decoded = contract.interface.decodeFunctionResult("getMyFriendList", result);
        return decoded[0]; // Struct array
    };

    try {
        const priyaFriends = await getFriendsFor(priyaAddress);
        console.log(`\n📋 Priya's Friends (${priyaFriends.length}):`);
        priyaFriends.forEach(f => console.log(`   - ${f.name} (${f.pubkey})`));

        const isAliceFriend = priyaFriends.some(f => f.pubkey.toLowerCase() === aliceAddress.toLowerCase());

        if (isAliceFriend) {
            console.log("\n✅ Alice is ALREADY in Priya's friend list!");
            console.log("   --> This explains the transaction failure ('Already friends')");
        } else {
            console.log("\n❌ Alice is NOT in Priya's friend list.");
        }

    } catch (e) {
        console.error("Error fetching friends:", e.message);
    }
}

main();
