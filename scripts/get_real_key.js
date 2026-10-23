const { HDNodeWallet } = require("ethers");

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";
    const targetAddress = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"; // Standard Hardhat Account #4

    console.log("Searching for correct private key...");

    // Create wallet at the standard Ethereum base path
    const root = HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0");

    for (let i = 0; i < 10; i++) {
        const child = root.deriveChild(i);
        console.log(`Index ${i}: ${child.address}`);

        if (child.address.toLowerCase() === targetAddress.toLowerCase()) {
            console.log("\nFOUND MATCH!");
            console.log("Address:", child.address);
            console.log("Private Key:", child.privateKey);
            return;
        }
    }
    console.log("No match found in first 10 indices.");
}

main().catch(console.error);
