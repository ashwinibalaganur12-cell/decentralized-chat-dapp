const hre = require("hardhat");

async function main() {
    console.log("Deploying ChatApp...");
    const ChatApp = await hre.ethers.getContractFactory("ChatApp");
    const chatApp = await ChatApp.deploy();
    await chatApp.waitForDeployment();
    console.log(`ChatApp deployed to: ${chatApp.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
