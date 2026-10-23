const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying TBCToken...");
    const TBCToken = await hre.ethers.getContractFactory("TBCToken");
    const token = await TBCToken.deploy();
    await token.waitForDeployment();
    const address = await token.getAddress();
    console.log("TBCToken deployed to:", address);
    fs.writeFileSync("token_address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
