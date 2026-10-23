const { Wallet } = require("ethers");
const fs = require("fs");

async function main() {
    const privateKey = "0x92db14e403b83dfe3df233f83dfa3a0b7096d21f2b80eb14161f33485d535359";
    const wallet = new Wallet(privateKey);
    console.log("Address:", wallet.address);
    fs.writeFileSync("derived_address.txt", wallet.address);
}

main().catch(console.error);
