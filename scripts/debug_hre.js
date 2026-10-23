const hre = require("hardhat");

async function main() {
    console.log("HRE initialized successfully");
    console.log("Networks:", Object.keys(hre.config.networks));
    if (hre.ethers) {
        console.log("hre.ethers is present");
    } else {
        console.error("hre.ethers is MISSING");
    }
}

main().catch(console.error);
