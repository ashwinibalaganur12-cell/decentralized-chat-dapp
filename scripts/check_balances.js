import hre from "hardhat";

async function main() {
    const signers = await hre.ethers.getSigners();
    console.log("Checking balances on Localhost...");

    for (let i = 0; i < 5; i++) {
        const balance = await hre.ethers.provider.getBalance(signers[i].address);
        console.log(`Account #${i}: ${signers[i].address}`);
        console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
        console.log("--------------------------------------------------");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
