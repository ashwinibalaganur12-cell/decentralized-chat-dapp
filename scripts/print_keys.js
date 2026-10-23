const hre = require("hardhat");

async function main() {
    // We can't easily get private keys from 'getSigners()' directly in ethers v6/hardhat-toolbox depending on setup, 
    // but for the default hardhat network they are standard. 
    // However, let's use a network config hack or just print the standard ones if we can't extract them.
    // Actually, check hardhat config accounts.

    // Easiest is to just print the known deterministic key for index 4 if we are on localhost/hardhat default.
    // Mnemonic: test test test test test test test test test test test junk

    const wallet = hre.ethers.Wallet.fromPhrase("test test test test test test test test test test test junk");
    const account4 = wallet.deriveChild(4);

    console.log("Account 4 Address:", account4.address);
    console.log("Account 4 Private Key:", account4.privateKey);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
