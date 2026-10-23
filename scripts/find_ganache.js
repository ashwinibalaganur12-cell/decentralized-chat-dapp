const { ethers } = require("ethers");

async function checkPort(port) {
    const url = `http://127.0.0.1:${port}`;
    try {
        const provider = new ethers.JsonRpcProvider(url);
        const network = await provider.getNetwork();
        console.log(`✅ FOUND RPC at ${url} -> Chain ID: ${network.chainId}`);
        return true;
    } catch (e) {
        console.log(`❌ No RPC at ${url} (${e.message})`);
        return false;
    }
}

async function main() {
    console.log("Scanning for Ganache/Hardhat...");
    await checkPort(1337);
    await checkPort(7545);
    await checkPort(8545);
}

main();
