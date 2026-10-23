const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Checking Friend List Return Format...");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 1. Get Contract
    const addressPath = path.join(__dirname, "../contract_address.txt");
    const contractAddress = fs.readFileSync(addressPath, "utf8").trim();
    const artifactPath = path.join(__dirname, "../src/artifacts/contracts/ChatApp.sol/ChatApp.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 2. Impersonate Priya
    const priyaAddress = "0x4a1054F8af18b7A41e5f36565c4136E872f1D6A0";
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);

    // 3. Raw Call to inspect return data structure
    try {
        const data = contract.interface.encodeFunctionData("getMyFriendList", []);
        const result = await provider.call({
            to: contractAddress,
            data: data,
            from: priyaAddress
        });

        const decoded = contract.interface.decodeFunctionResult("getMyFriendList", result);
        const friends = decoded[0];

        console.log(`\n📋 Raw Friend List Array (${friends.length}):`);
        console.log(friends);

        if (friends.length > 0) {
            console.log("\n🔎 First Friend Object Keys:");
            // Check properties of the Result object (Ethers v6)
            /*
             Ethers v6 returns a Result object that is array-like but also has named properties.
             If iterating with .map(), it should work fine, but let's verify accessing properties.
            */
            const f = friends[0];
            console.log(`   [0]: ${f[0]} (address?)`); // Index access
            console.log(`   pubkey: ${f.pubkey}`);     // Named access
            console.log(`   name: ${f.name}`);         // Named access
        }

    } catch (e) {
        console.error("Error fetching friends:", e.message);
    }
}

main();
