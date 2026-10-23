const { HDNodeWallet } = require("ethers");

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";
    // Standard path, derive index 18
    const root = HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0");
    const child = root.deriveChild(18);

    console.log("Account Index: 18");
    console.log("Address:", child.address);
    console.log("Private Key:", child.privateKey);
}

main().catch(console.error);
