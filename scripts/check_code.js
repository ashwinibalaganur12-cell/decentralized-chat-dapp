import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const { ethers } = hre;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    let address;
    try {
        address = fs.readFileSync(path.join(__dirname, "../contract_address.txt"), "utf8").trim();
    } catch (e) {
        console.error("Could not read contract_address.txt");
        process.exit(1);
    }

    console.log(`Checking code at address: ${address}`);

    const provider = ethers.provider;
    const code = await provider.getCode(address);

    if (code === "0x") {
        console.log("NO CODE found at this address. Contract is not deployed here.");
    } else {
        console.log("Code found! Contract is deployed.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
