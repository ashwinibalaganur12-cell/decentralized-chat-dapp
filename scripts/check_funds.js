const { ethers } = require("ethers");

async function main() {
    console.log("🔍 Checking network state...");

    // Connect to local node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    try {
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected! Current Block: ${blockNumber}`);

        // Check contract code
        const contractAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
            console.error("❌ Contract NOT found at " + contractAddress);
        } else {
            console.log("✅ Contract found at " + contractAddress);
        }

        console.log("\n💰 Checking default accounts:");
        // Hardhat default mnemonic usually generates these
        const signer = await provider.getSigner(0);
        // List first 5 accounts from provider (if it exposes them)
        const accounts = await provider.listAccounts();

        for (let i = 0; i < Math.min(accounts.length, 5); i++) {
            const acc = accounts[i];
            const bal = await provider.getBalance(acc.address);
            console.log(`   Account #${i} (${acc.address}): ${ethers.formatEther(bal)} ETH`);
        }

    } catch (e) {
        console.error("❌ Connection failed:", e.message);
    }
}

main();
