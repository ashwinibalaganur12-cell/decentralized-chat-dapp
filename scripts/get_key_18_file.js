const { HDNodeWallet } = require("ethers");
const fs = require("fs");

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";
    const root = HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0");
    const child = root.deriveChild(18);
    console.log("Private Key:", child.privateKey);
    fs.writeFileSync("real_key_18.txt", child.privateKey);
}

main().catch(console.error);
