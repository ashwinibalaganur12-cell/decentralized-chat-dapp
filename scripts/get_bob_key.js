const { HDNodeWallet } = require("ethers");
const fs = require("fs");

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";
    // Bob is Account Index 1 (Hardhat Account #1)
    const root = HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0");
    const child = root.deriveChild(1);

    console.log("Bob's Address:", child.address);
    console.log("Bob's Private Key:", child.privateKey);

    fs.writeFileSync("bob_key.txt", child.privateKey);
}

main().catch(console.error);
